import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(
    @Body()
    body: {
      id_reservation: number;
      montant: number;
      methode: PaymentMethod;
      received_by?: number;
    },
  ) {
    try {
      return await this.paymentsService.createPayment(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllPayments() {
    return await this.paymentsService.getAllPayments();
  }

  @Get(':id')
  async getPaymentById(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.paymentsService.getPaymentById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('reservation/:id')
  async getPaymentsByReservation(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentsService.getPaymentsByReservation(id);
  }

  @Put(':id')
  async updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ montant: number; methode: PaymentMethod }>,
  ) {
    try {
      return await this.paymentsService.updatePayment(id, body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async deletePayment(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.paymentsService.deletePayment(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
