import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  safeUserSelect = {
    id_user: true,
    nom: true,
    prenom: true,
    email: true,
    role: true,
    telephone: true,
    created_at: true,
  };
  async createUser(data: {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
    role: UserRole;
    telephone?: string;
  }) {
    // CHECK 1: email uniqueness
    data.email = data.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    // CHECK 2: password strength (minimum)
    if (data.mot_de_passe.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // STEP 3: hash password
    const hashedPassword = await bcrypt.hash(data.mot_de_passe, 10);

    // STEP 4: create user
    return this.prisma.user.create({
      data: {
        ...data,
        mot_de_passe: hashedPassword,
      },
      select: this.safeUserSelect,
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({ select: this.safeUserSelect });
  }

  async getUserById(id_user: number) {
    return this.prisma.user.findUnique({
      where: { id_user },
      select: this.safeUserSelect,
    });
  }
  // UsersService
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async getUserByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id_user: true,
        email: true,
        mot_de_passe: true,
        role: true,
      },
    });
  }

  async deleteUser(id_user: number) {
    return this.prisma.user.delete({ where: { id_user } });
  }

  async updateUser(
    id_user: number,
    data: Partial<{
      nom: string;
      prenom: string;
      email: string;
      mot_de_passe: string;
      role: UserRole;
      telephone: string;
    }>,
    options?: { allowRoleChange?: boolean },
  ) {
    const updateData: Partial<{
      nom: string;
      prenom: string;
      email: string;
      mot_de_passe: string;
      role: UserRole;
      telephone: string | null;
    }> = {};

    // -------- PROFILE FIELDS --------
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.prenom !== undefined) updateData.prenom = data.prenom;
    if (data.telephone !== undefined) updateData.telephone = data.telephone;

    if (data.email) {
      data.email = data.email.toLowerCase().trim();
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id_user !== id_user) {
        throw new Error('Email already in use');
      }

      updateData.email = data.email;
    }

    if (data.mot_de_passe) {
      if (data.mot_de_passe.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      updateData.mot_de_passe = await bcrypt.hash(data.mot_de_passe, 10);
    }

    if (data.role) {
      if (!options?.allowRoleChange) {
        throw new Error('Not allowed to change role');
      }
      updateData.role = data.role;
    }

    return this.prisma.user.update({
      where: { id_user },
      data: updateData,
    });
  }
}
