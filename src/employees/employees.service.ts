import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class EmployeesService {
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

  async createEmployee(data: {
    id_user: number;
    salaire: number;
    date_embauche: Date;
  }) {
    // CHECK 1: user exists
    const user = await this.prisma.user.findUnique({
      where: { id_user: data.id_user },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // CHECK 2: user role
    if (user.role !== UserRole.EMPLOYEE) {
      throw new Error('User role must be EMPLOYEE');
    }

    // CHECK 3: already employee?
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { id_user: data.id_user },
    });

    if (existingEmployee) {
      throw new Error('Employee already exists for this user');
    }

    // CHECK 4: salary
    if (data.salaire <= 0) {
      throw new Error('Salary must be positive');
    }

    return this.prisma.employee.create({
      data,
    });
  }

  async getEmployeeById(id_employee: number) {
    return this.prisma.employee.findUnique({
      where: { id_employee },
      include: {
        user: { select: this.safeUserSelect },
        payments: true,
        reservations: true,
      },
    });
  }

  async getAllEmployees() {
    return this.prisma.employee.findMany({
      include: {
        user: { select: this.safeUserSelect },
      },
    });
  }
}
