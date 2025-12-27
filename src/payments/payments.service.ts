import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
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

  // ---------------- CREATE PAYMENT ----------------
  async createPayment(data: {
    id_reservation: number;
    montant: number;
    methode: PaymentMethod;
    received_by?: number; // employee ID
  }) {
    // Step 1: Check reservation exists
    const reservation = await this.prisma.reservation.findUnique({
      where: { id_reservation: data.id_reservation },
      include: { invoice: true, client: { include: { user: true } } },
    });
    if (!reservation) throw new Error('Reservation not found');

    // Step 2: Check reservation status
    if (reservation.statut === 'CANCELLED') {
      throw new Error('Cannot pay for a cancelled reservation');
    }

    // Step 3: Check amount is positive
    if (data.montant <= 0) throw new Error('Payment amount must be positive');

    // Step 4: Optionally check against invoice total
    if (reservation.invoice && data.montant > reservation.invoice.total) {
      throw new Error('Payment amount exceeds invoice total');
    }

    // Step 5: Optional: check employee exists if received_by provided
    if (data.received_by) {
      const employee = await this.prisma.employee.findUnique({
        where: { id_employee: data.received_by },
      });
      if (!employee) throw new Error('Receiving employee not found');
    }

    // Step 6: Create payment
    return this.prisma.payment.create({
      data: {
        id_reservation: data.id_reservation,
        montant: data.montant,
        methode: data.methode,
        received_by: data.received_by,
      },
      include: {
        reservation: {
          include: {
            client: {
              include: {
                user: { select: this.safeUserSelect },
              },
            },
          },
        },
        employee: true,
      },
    });
  }

  // ---------------- GET PAYMENTS ----------------
  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        reservation: {
          include: {
            client: { select: this.safeUserSelect },
            rooms: { include: { room: true } },
          },
        },
        employee: true,
      },
    });
  }

  async getPaymentById(id_payment: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment },
      include: {
        reservation: { include: { client: { select: this.safeUserSelect } } },
        employee: true,
      },
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async getPaymentsByReservation(id_reservation: number) {
    return this.prisma.payment.findMany({
      where: { id_reservation },
      include: {
        employee: true,
        reservation: { include: { client: { select: this.safeUserSelect } } },
      },
    });
  }

  // ---------------- UPDATE PAYMENT ----------------
  async updatePayment(
    id_payment: number,
    data: Partial<{ montant: number; methode: PaymentMethod }>,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment },
      include: { reservation: true },
    });
    if (!payment) throw new Error('Payment not found');

    // Prevent updating payments for confirmed or completed reservations
    if (
      payment.reservation &&
      ['CONFIRMED', 'COMPLETED'].includes(payment.reservation.statut)
    ) {
      throw new Error(
        'Cannot update payment linked to a confirmed or completed reservation',
      );
    }

    // Validate amount
    if (data.montant !== undefined && data.montant <= 0) {
      throw new Error('Payment amount must be positive');
    }

    return this.prisma.payment.update({
      where: { id_payment },
      data,
    });
  }

  // ---------------- DELETE PAYMENT ----------------
  async deletePayment(id_payment: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment },
      include: { reservation: true },
    });
    if (!payment) throw new Error('Payment not found');

    if (
      payment.reservation &&
      ['CONFIRMED', 'COMPLETED'].includes(payment.reservation.statut)
    ) {
      throw new Error(
        'Cannot delete payment linked to a confirmed or completed reservation',
      );
    }

    return this.prisma.payment.delete({ where: { id_payment } });
  }
}
