import { NestFactory } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { RoomsService } from '../rooms/rooms.service';
import { RoomTypesService } from '../room-types/room-types.service';
import { ReservationsService } from '../reservations/reservations.service';
import { PaymentsService } from '../payments/payments.service';
import { InvoiceService } from '../invoices/invoices.service';
import { AppModule } from '../app.module';
import {
  PrismaClient,
  UserRole,
  RoomStatus,
  PaymentMethod,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EmployeesService } from '../employees/employees.service';
import { AuthService } from '../auth/auth.service';

const prisma = new PrismaClient();

// instantiate services manually (no Nest DI)
const usersService = new UsersService(prisma as any);
const authService = new AuthService(usersService, prisma as any);

const clientsService = new ClientsService(prisma as any);
const employeesService = new EmployeesService(prisma as any);
const roomsService = new RoomsService(prisma as any);
const reservationsService = new ReservationsService(prisma as any);
const paymentsService = new PaymentsService(prisma as any);
const invoiceService = new InvoiceService(prisma as any);


async function main() {
  console.log('🚀 TESTING AUTHENTICATION\n');

  // 1. Create a test user
  const email = 'auth_test@example.com';
  const password = 'StrongPass123';
  const hashedPassword = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await usersService.createUser({
      nom: 'Auth',
      prenom: 'Tester',
      email,
      mot_de_passe: password,
      role: UserRole.CLIENT,
    });
    console.log('✅ User created');
  } catch (e: any) {
    console.log('⚠️ User already exists, fetching...');
    user = await usersService
      .getAllUsers()
      .then((users) => users.find((u) => u.email === email));
  }

  // 2. Test correct credentials
  try {
    const validated = await authService.validateUser(email, password);
    console.log('✅ Correct credentials validated:', validated.id_user);
  } catch (e) {
    console.error('❌ Correct credentials failed', e);
  }

  // 3. Test incorrect password
  try {
    await authService.validateUser(email, 'WrongPass');
    console.error('❌ Wrong password should fail but passed');
  } catch (e) {
    console.log('✅ Wrong password correctly rejected');
  }

  // 4. Test non-existent email
  try {
    await authService.validateUser('noone@example.com', 'AnyPass');
    console.error('❌ Non-existent email should fail but passed');
  } catch (e) {
    console.log('✅ Non-existent email correctly rejected');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());