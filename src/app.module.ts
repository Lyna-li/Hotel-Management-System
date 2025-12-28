import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { EmployeesModule } from './employees/employees.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';
import { ClientsController } from './clients/clients.controller';
import { EmployeesController } from './employees/employees.controller'
import { InvoicesController } from './invoices/invoices.controller';


@Module({
  imports: [PrismaModule, UsersModule, ClientsModule, EmployeesModule, RoomTypesModule, RoomsModule, ReservationsModule, PaymentsModule, InvoicesModule, AuthModule],
  controllers: [ClientsController, EmployeesController, InvoicesController],
})
export class AppModule {}
