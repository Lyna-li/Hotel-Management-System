import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ClientsService {
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

  async createClient(id_user: number) {
    // CHECK 1: user exists
    const user = await this.prisma.user.findUnique({
      where: { id_user },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // CHECK 2: role must be CLIENT
    if (user.role !== UserRole.CLIENT) {
      throw new Error('User role must be CLIENT');
    }

    // CHECK 3: already client?
    const existingClient = await this.prisma.client.findUnique({
      where: { id_user },
    });

    if (existingClient) {
      throw new Error('Client already exists for this user');
    }

    return this.prisma.client.create({
      data: { id_user },
    });
  }

  async getClientById(id_client: number) {
    return this.prisma.client.findUnique({
      where: { id_client },
      include: {
        user: { select: this.safeUserSelect },
        reservations: true,
      },
    });
  }

  async getAllClients() {
    return this.prisma.client.findMany({
      include: {
        user: { select: this.safeUserSelect },
      },
    });
  }
}
