import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
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

    // STEP 4: create user WITH transaction to create related records
    return await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone || null,
          mot_de_passe: hashedPassword,
          role: data.role,
        },
        select: this.safeUserSelect,
      });

      // Create related record based on role
      if (data.role === UserRole.CLIENT) {
        await tx.client.create({
          data: {
            id_user: user.id_user,
          },
        });
        console.log(`Created Client record for user ${user.id_user}`);
      } else if (data.role === UserRole.EMPLOYEE) {
        await tx.employee.create({
          data: {
            id_user: user.id_user,
            salaire: 3000, // Default salary
            date_embauche: new Date(),
          },
        });
        console.log(`Created Employee record for user ${user.id_user}`);
      }

      return user;
    });
  }

  // Update getAllUsers to include related records
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        ...this.safeUserSelect,
        client: {
          select: {
            id_client: true,
          },
        },
        employee: {
          select: {
            id_employee: true,
          },
        },
      },
    });
  }

  async getUserById(id_user: number) {
    return this.prisma.user.findUnique({
      where: { id_user },
      select: {
        ...this.safeUserSelect,
        client: {
          select: {
            id_client: true,
          },
        },
        employee: {
          select: {
            id_employee: true,
          },
        },
      },
    });
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ 
      where: { email },
      select: {
        ...this.safeUserSelect,
        client: {
          select: {
            id_client: true,
          },
        },
        employee: {
          select: {
            id_employee: true,
          },
        },
      },
    });
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
    // Use transaction to delete related records
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id_user },
        include: {
          client: true,
          employee: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Delete related records based on role
      if (user.role === UserRole.CLIENT && user.client) {
        // Check if client has reservations before deleting
        const reservations = await tx.reservation.count({
          where: { id_client: user.client.id_client },
        });

        if (reservations > 0) {
          throw new Error('Cannot delete client with existing reservations');
        }

        await tx.client.delete({
          where: { id_client: user.client.id_client },
        });
      } else if (user.role === UserRole.EMPLOYEE && user.employee) {
        // Check if employee has associated records
        const validatedReservations = await tx.reservation.count({
          where: { validated_by: user.employee.id_employee },
        });

        const payments = await tx.payment.count({
          where: { received_by: user.employee.id_employee },
        });

        if (validatedReservations > 0 || payments > 0) {
          throw new Error('Cannot delete employee with associated reservations or payments');
        }

        await tx.employee.delete({
          where: { id_employee: user.employee.id_employee },
        });
      }

      // Delete the user
      return await tx.user.delete({
        where: { id_user },
        select: this.safeUserSelect,
      });
    });
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
    return await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { id_user },
        include: {
          client: true,
          employee: true,
        },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

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
        const emailUser = await tx.user.findUnique({
          where: { email: data.email },
        });

        if (emailUser && emailUser.id_user !== id_user) {
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

      // Handle role change
      if (data.role && data.role !== existingUser.role) {
        if (!options?.allowRoleChange) {
          throw new Error('Not allowed to change role');
        }
        updateData.role = data.role;

        // Delete old related records
        if (existingUser.role === UserRole.CLIENT && existingUser.client) {
          await tx.client.delete({
            where: { id_client: existingUser.client.id_client },
          });
        } else if (existingUser.role === UserRole.EMPLOYEE && existingUser.employee) {
          await tx.employee.delete({
            where: { id_employee: existingUser.employee.id_employee },
          });
        }

        // Create new related records
        if (data.role === UserRole.CLIENT) {
          await tx.client.create({
            data: {
              id_user: id_user,
            },
          });
        } else if (data.role === UserRole.EMPLOYEE) {
          await tx.employee.create({
            data: {
              id_user: id_user,
              salaire: 3000,
              date_embauche: new Date(),
            },
          });
        }
      }

      // Update user
      return await tx.user.update({
        where: { id_user },
        data: updateData,
        select: this.safeUserSelect,
      });
    });
  }
}