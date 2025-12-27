import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  // Create a new room
  // ---------------- CREATE ROOM ----------------
  async createRoom(data: {
    numero: string;
    etage: number;
    prix_par_nuit: number;
    statut: RoomStatus;
    id_type: number;
  }) {
    // Validate room type exists
    const roomType = await this.prisma.roomType.findUnique({
      where: { id_type: data.id_type },
    });
    if (!roomType) throw new Error('Invalid room type');

    // Validate price
    if (data.prix_par_nuit <= 0) throw new Error('Price must be positive');

    // Validate floor
    if (data.etage < 0) throw new Error('Floor must be 0 or higher');

    // Optional: Check unique room number per floor
    const existingRoom = await this.prisma.room.findFirst({
      where: { numero: data.numero, etage: data.etage },
    });
    if (existingRoom)
      throw new Error('Room number already exists on this floor');

    return this.prisma.room.create({ data });
  }

  // ---------------- UPDATE ROOM ----------------
  async updateRoom(
    id: number,
    data: Partial<{
      numero: string;
      etage: number;
      prix_par_nuit: number;
      statut: RoomStatus;
      id_type: number;
    }>,
  ) {
    if (data.id_type) {
      const roomType = await this.prisma.roomType.findUnique({
        where: { id_type: data.id_type },
      });
      if (!roomType) throw new Error('Invalid room type');
    }

    if (data.prix_par_nuit !== undefined && data.prix_par_nuit <= 0)
      throw new Error('Price must be positive');

    if (data.etage !== undefined && data.etage < 0)
      throw new Error('Floor must be 0 or higher');

    return this.prisma.room.update({ where: { id_room: id }, data });
  }

  // ---------------- GET AVAILABLE ROOMS ----------------
  async getAvailableRooms() {
    return this.prisma.room.findMany({
      where: { statut: RoomStatus.AVAILABLE },
      include: { roomType: true },
    });
  }

  // Get all rooms (with type info)
  async getAllRooms() {
    return this.prisma.room.findMany({ include: { roomType: true } });
  }

  // Get a room by ID
  async getRoomById(id: number) {
    return this.prisma.room.findUnique({
      where: { id_room: id },
      include: { roomType: true },
    });
  }

  // Delete room safely
  async deleteRoom(id: number) {
    // Step 1: Check if room exists
    const room = await this.prisma.room.findUnique({ where: { id_room: id } });
    if (!room) throw new Error('Room not found');

    // Step 2: Check for active or upcoming reservations
    const activeReservations = await this.prisma.reservationRoom.findMany({
      where: {
        id_room: id,
        reservation: {
          statut: { in: ['PENDING', 'CONFIRMED'] }, // only active reservations
          date_fin: { gte: new Date() }, // reservation hasn't ended yet
        },
      },
    });

    if (activeReservations.length > 0) {
      throw new Error(
        'Cannot delete room with active or upcoming reservations',
      );
    }

    // Step 3: Safe delete
    return this.prisma.room.delete({ where: { id_room: id } });
  }

  // Update room status
  async updateRoomStatus(id: number, status: RoomStatus) {
    return this.prisma.room.update({
      where: { id_room: id },
      data: { statut: status },
    });
  }
}
