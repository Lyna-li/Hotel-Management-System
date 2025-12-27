import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceService {
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

  // ---------------- CREATE INVOICE ----------------
  async createInvoice(id_reservation: number) {
    // Step 1: Fetch reservation with rooms
    const reservation = await this.prisma.reservation.findUnique({
      where: { id_reservation },
      include: { rooms: { include: { room: true } } },
    });

    if (!reservation) throw new Error('Reservation not found');

    // Step 2: Check reservation status
    if (
      reservation.statut !== 'CONFIRMED' &&
      reservation.statut !== 'COMPLETED'
    ) {
      throw new Error(
        'Invoice can only be created for confirmed or completed reservations',
      );
    }

    // Step 3: Check if invoice already exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id_reservation },
    });
    if (existingInvoice)
      throw new Error('Invoice already exists for this reservation');

    // Step 4: Calculate total
    const days =
      (reservation.date_fin.getTime() - reservation.date_debut.getTime()) /
      (1000 * 60 * 60 * 24);
    if (days <= 0) throw new Error('Invalid reservation duration');

    let total = 0;
    reservation.rooms.forEach((resRoom) => {
      total += resRoom.room.prix_par_nuit * days;
    });

    if (total <= 0) throw new Error('Invalid invoice total');

    // Step 5: Create invoice
    return this.prisma.invoice.create({
      data: {
        id_reservation,
        total,
      },
    });
  }

  // ---------------- GET ALL INVOICES ----------------
  async getAllInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        reservation: {
          include: {
            client: { include: { user: { select: this.safeUserSelect } } },
            rooms: { include: { room: true } },
          },
        },
      },
    });
  }

  // ---------------- GET INVOICE BY RESERVATION ----------------
  async getInvoiceByReservation(id_reservation: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id_reservation },
      include: {
        reservation: {
          include: {
            client: { include: { user: { select: this.safeUserSelect } } },
            rooms: { include: { room: true } },
          },
        },
      },
    });

    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  // ---------------- DELETE INVOICE ----------------
  async deleteInvoice(id_invoice: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id_invoice },
      include: { reservation: { include: { payments: true } } },
    });

    if (!invoice) throw new Error('Invoice not found');

    // Prevent deleting if payments exist
    if (invoice.reservation.payments.length > 0) {
      throw new Error('Cannot delete invoice with payments');
    }

    // Optional: prevent deleting invoice for completed reservations
    if (invoice.reservation.statut === 'COMPLETED') {
      throw new Error('Cannot delete invoice for completed reservation');
    }

    return this.prisma.invoice.delete({ where: { id_invoice } });
  }
}
