import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus, RoomStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private safeUserSelect = {
    id_user: true,
    nom: true,
    prenom: true,
    email: true,
    role: true,
    telephone: true,
    created_at: true,
  };

  // ---------------- CREATE RESERVATION ----------------
  async createReservation(data: {
    id_client: number;
    roomIds: number[];
    date_debut: Date;
    date_fin: Date;
  }) {
    if (!data.roomIds.length) {
      throw new Error('At least one room must be reserved');
    }

    if (data.date_fin <= data.date_debut) {
      throw new Error('End date must be after start date');
    }

    // Check client exists
    const client = await this.prisma.client.findUnique({
      where: { id_client: data.id_client },
    });
    if (!client) throw new Error('Client not found');

    // Check rooms exist and are available for dates
    await this.checkRoomAvailability(
      data.roomIds,
      data.date_debut,
      data.date_fin,
    );

    // Transaction ensures consistency
    return this.prisma.$transaction(async (tx) => {
      // Step 1: create reservation
      const reservation = await tx.reservation.create({
        data: {
          id_client: data.id_client,
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          statut: ReservationStatus.PENDING,
        },
      });

      // Step 2: link rooms (junction table)
      const reservationRooms = data.roomIds.map((roomId) => ({
        id_reservation: reservation.id_reservation,
        id_room: roomId,
      }));
      await tx.reservationRoom.createMany({ data: reservationRooms });

      // Rooms remain AVAILABLE until confirmation

      return reservation;
    });
  }

  // ---------------- CONFIRM RESERVATION ----------------
  async confirmReservation(reservationId: number, employeeId: number) {
    // Check reservation exists
    const reservation = await this.prisma.reservation.findUnique({
      where: { id_reservation: reservationId },
    });
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.statut !== ReservationStatus.PENDING) {
      throw new Error('Only PENDING reservations can be confirmed');
    }

    // Check employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id_user: employeeId },
    });
    if (!employee) throw new Error('Employee not found');

    // Transaction ensures atomic update
    return this.prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id_reservation: reservationId },
        data: {
          statut: ReservationStatus.CONFIRMED,
          validated_by: employee.id_employee,
        },
      });

      // Update room status to OCCUPIED
      const rooms = await tx.reservationRoom.findMany({
        where: { id_reservation: reservationId },
      });

      await tx.room.updateMany({
        where: { id_room: { in: rooms.map((r) => r.id_room) } },
        data: { statut: RoomStatus.OUT_OF_SERVICE },
      });

      return updatedReservation;
    });
  }

  // ---------------- FINISH RESERVATION ----------------
  async finishReservation(reservationId: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id_reservation: reservationId },
    });
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.statut !== ReservationStatus.CONFIRMED) {
      throw new Error('Only CONFIRMED reservations can be completed');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id_reservation: reservationId },
        data: { statut: ReservationStatus.COMPLETED },
      });

      const rooms = await tx.reservationRoom.findMany({
        where: { id_reservation: reservationId },
      });

      await tx.room.updateMany({
        where: { id_room: { in: rooms.map((r) => r.id_room) } },
        data: { statut: RoomStatus.AVAILABLE },
      });
    });
  }

  // ---------------- DELETE RESERVATION ----------------
  async deleteReservation(reservationId: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id_reservation: reservationId },
    });
    if (!reservation) throw new Error('Reservation not found');

    if (reservation.statut !== ReservationStatus.PENDING) {
      throw new Error('Only pending reservations can be deleted');
    }

    const payments = await this.prisma.payment.findMany({
      where: { id_reservation: reservationId },
    });
    if (payments.length > 0) {
      throw new Error('Cannot delete reservation with payments');
    }

    return this.prisma.$transaction(async (tx) => {
      const reservationRooms = await tx.reservationRoom.findMany({
        where: { id_reservation: reservationId },
      });
      const roomIds = reservationRooms.map((r) => r.id_room);

      await tx.reservationRoom.deleteMany({
        where: { id_reservation: reservationId },
      });

      await tx.reservation.delete({
        where: { id_reservation: reservationId },
      });

      await tx.room.updateMany({
        where: { id_room: { in: roomIds } },
        data: { statut: RoomStatus.AVAILABLE },
      });

      return { deletedReservationId: reservationId };
    });
  }

  // ---------------- GET RESERVATIONS ----------------
  async getAllReservations() {
    return this.prisma.reservation.findMany({
      include: {
        client: { include: { user: { select: this.safeUserSelect } } },
        rooms: { include: { room: true } },
        payments: true,
        invoice: true,
      },
    });
  }

  async getReservationById(id: number) {
    return this.prisma.reservation.findUnique({
      where: { id_reservation: id },
      include: {
        client: { include: { user: { select: this.safeUserSelect } } },
        rooms: { include: { room: true } },
        payments: true,
        invoice: true,
      },
    });
  }

  // ---------------- CHECK ROOM AVAILABILITY ----------------
  async checkRoomAvailability(
    roomIds: number[],
    dateStart: Date,
    dateEnd: Date,
  ) {
    const conflictingReservations = await this.prisma.reservationRoom.findMany({
      where: {
        id_room: { in: roomIds },
        reservation: {
          AND: [
            { date_debut: { lte: dateEnd } },
            { date_fin: { gte: dateStart } },
            { statut: { not: ReservationStatus.CANCELLED } },
          ],
        },
      },
    });

    if (conflictingReservations.length > 0) {
      throw new Error('Some rooms are already booked for this date range');
    }

    return true;
  }
}
