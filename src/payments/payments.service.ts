import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

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
    received_by?: number;
    transactionRef?: string;
  }) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id_reservation: data.id_reservation },
      include: {
        invoice: true,
        client: { include: { user: true } },
        payments: true,
      },
    });

    if (!reservation) throw new Error('Reservation not found');
    if (reservation.statut === 'CANCELLED') {
      throw new Error('Cannot pay for a cancelled reservation');
    }
    if (data.montant <= 0) throw new Error('Payment amount must be positive');

    // Calculate total already paid
    const totalPaid = reservation.payments.reduce(
      (sum, p) => (p.status === 'SUCCESS' ? sum + p.montant : sum),
      0,
    );

    // Check against invoice if exists
    if (reservation.invoice) {
      const remaining = reservation.invoice.total - totalPaid;
      if (data.montant > remaining) {
        throw new Error(
          `Payment exceeds remaining balance. Remaining: ${remaining}`,
        );
      }
    }

    if (data.received_by) {
      const employee = await this.prisma.employee.findUnique({
        where: { id_employee: data.received_by },
      });
      if (!employee) throw new Error('Receiving employee not found');
    }

    // Determine initial status based on payment method
    const initialStatus = this.getInitialPaymentStatus(data.methode);

    return this.prisma.payment.create({
      data: {
        id_reservation: data.id_reservation,
        montant: data.montant,
        methode: data.methode,
        status: initialStatus,
        received_by: data.received_by,
        transactionRef: data.transactionRef,
      },
      include: {
        reservation: {
          include: {
            client: { include: { user: { select: this.safeUserSelect } } },
            invoice: true,
          },
        },
        employee: { include: { user: { select: this.safeUserSelect } } },
      },
    });
  }

  // ---------------- UPDATE PAYMENT STATUS ----------------
  async updatePaymentStatus(
    id_payment: number,
    status: PaymentStatus,
    transactionRef?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment },
      include: { reservation: { include: { payments: true, invoice: true } } },
    });

    if (!payment) throw new Error('Payment not found');

    const updated = await this.prisma.payment.update({
      where: { id_payment },
      data: {
        status,
        transactionRef: transactionRef || payment.transactionRef,
      },
      include: {
        reservation: { include: { payments: true, invoice: true } },
      },
    });

    // Auto-update reservation status if fully paid
    if (status === 'SUCCESS') {
      await this.checkAndUpdateReservationStatus(updated.reservation);
    }

    return updated;
  }

  // ---------------- GET PAYMENTS ----------------
  async getAllPayments(filters?: {
    status?: PaymentStatus;
    methode?: PaymentMethod;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.methode) where.methode = filters.methode;
    if (filters?.fromDate || filters?.toDate) {
      where.date_payment = {};
      if (filters.fromDate) where.date_payment.gte = filters.fromDate;
      if (filters.toDate) where.date_payment.lte = filters.toDate;
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        reservation: {
          include: {
            client: { include: { user: { select: this.safeUserSelect } } },
            rooms: { include: { room: true } },
          },
        },
        employee: { include: { user: { select: this.safeUserSelect } } },
      },
      orderBy: { date_payment: 'desc' },
    });
  }

  async getPaymentById(id_payment: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment },
      include: {
        reservation: {
          include: {
            client: { include: { user: { select: this.safeUserSelect } } },
            invoice: true,
            payments: true,
          },
        },
        employee: { include: { user: { select: this.safeUserSelect } } },
      },
    });

    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async getPaymentsByReservation(id_reservation: number) {
    return this.prisma.payment.findMany({
      where: { id_reservation },
      include: {
        employee: { include: { user: { select: this.safeUserSelect } } },
        reservation: {
          include: {
            client: { include: { user: { select: this.safeUserSelect } } },
            invoice: true,
          },
        },
      },
      orderBy: { date_payment: 'desc' },
    });
  }

  async getPaymentsByClient(id_client: number) {
    return this.prisma.payment.findMany({
      where: { reservation: { id_client } },
      include: {
        reservation: { include: { invoice: true } },
        employee: { include: { user: { select: this.safeUserSelect } } },
      },
      orderBy: { date_payment: 'desc' },
    });
  }

  // ---------------- PAYMENT SUMMARY ----------------
  async getReservationPaymentSummary(id_reservation: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id_reservation },
      include: { payments: true, invoice: true },
    });

    if (!reservation) throw new Error('Reservation not found');

    const totalPaid = reservation.payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.montant, 0);

    const totalPending = reservation.payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.montant, 0);

    const invoiceTotal = reservation.invoice?.total || 0;
    const remaining = invoiceTotal - totalPaid;

    return {
      id_reservation,
      invoiceTotal,
      totalPaid,
      totalPending,
      remaining,
      isFullyPaid: remaining <= 0 && invoiceTotal > 0,
      payments: reservation.payments,
    };
  }

  // ---------------- UPDATE PAYMENT ----------------
  async updatePayment(
    id_payment: number,
    data: Partial<{
      montant: number;
      methode: PaymentMethod;
      transactionRef: string;
    }>,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment },
      include: { reservation: true },
    });

    if (!payment) throw new Error('Payment not found');

    // Only allow updates for pending or failed payments
    if (!['PENDING', 'FAILED'].includes(payment.status)) {
      throw new Error('Can only update pending or failed payments');
    }

    if (data.montant !== undefined && data.montant <= 0) {
      throw new Error('Payment amount must be positive');
    }

    return this.prisma.payment.update({
      where: { id_payment },
      data,
      include: {
        reservation: { include: { invoice: true } },
        employee: { include: { user: { select: this.safeUserSelect } } },
      },
    });
  }

  // ---------------- REFUND PAYMENT ----------------
  async refundPayment(id_payment: number, refund_by?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment },
      include: { reservation: true },
    });

    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'SUCCESS') {
      throw new Error('Can only refund successful payments');
    }

    return this.prisma.payment.update({
      where: { id_payment },
      data: {
        status: 'REFUNDED',
        received_by: refund_by || payment.received_by,
      },
      include: {
        reservation: { include: { invoice: true } },
        employee: { include: { user: { select: this.safeUserSelect } } },
      },
    });
  }

  // ---------------- DELETE PAYMENT ----------------
  async deletePayment(id_payment: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment },
      include: { reservation: true },
    });

    if (!payment) throw new Error('Payment not found');

    // Only allow deletion of pending or failed payments
    if (!['PENDING', 'FAILED'].includes(payment.status)) {
      throw new Error('Can only delete pending or failed payments');
    }

    return this.prisma.payment.delete({ where: { id_payment } });
  }

  // ---------------- HELPER METHODS ----------------
  private getInitialPaymentStatus(methode: PaymentMethod): PaymentStatus {
    switch (methode) {
      case 'CASH':
      case 'CARD':
        return 'SUCCESS'; // Immediate confirmation
      case 'BANK_TRANSFER':
      case 'ONLINE':
        return 'PENDING'; // Requires verification
      default:
        return 'PENDING';
    }
  }

  private async checkAndUpdateReservationStatus(reservation: any) {
    if (!reservation.invoice) return;

    const totalPaid = reservation.payments
      .filter((p: any) => p.status === 'SUCCESS')
      .reduce((sum: number, p: any) => sum + p.montant, 0);

    if (
      totalPaid >= reservation.invoice.total &&
      reservation.statut === 'PENDING'
    ) {
      await this.prisma.reservation.update({
        where: { id_reservation: reservation.id_reservation },
        data: { statut: 'CONFIRMED' },
      });
    }
  }

  // ---------------- REPORTS ----------------
  async getPaymentStatistics(fromDate?: Date, toDate?: Date) {
    const where: any = {};
    if (fromDate || toDate) {
      where.date_payment = {};
      if (fromDate) where.date_payment.gte = fromDate;
      if (toDate) where.date_payment.lte = toDate;
    }

    const payments = await this.prisma.payment.findMany({ where });

    const byStatus = payments.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {} as Record<PaymentStatus, number>,
    );

    const byMethod = payments.reduce(
      (acc, p) => {
        acc[p.methode] = (acc[p.methode] || 0) + 1;
        return acc;
      },
      {} as Record<PaymentMethod, number>,
    );

    const totalRevenue = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.montant, 0);

    return {
      totalPayments: payments.length,
      totalRevenue,
      byStatus,
      byMethod,
      averagePayment: payments.length > 0 ? totalRevenue / payments.length : 0,
    };
  }
}
