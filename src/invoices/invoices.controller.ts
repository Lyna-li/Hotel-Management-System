import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InvoiceService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(
    @Body('id_reservation', ParseIntPipe) id_reservation: number,
  ) {
    try {
      return await this.invoiceService.createInvoice(id_reservation);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllInvoices() {
    return await this.invoiceService.getAllInvoices();
  }

  @Get('reservation/:id')
  async getInvoiceByReservation(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.invoiceService.getInvoiceByReservation(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async deleteInvoice(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.invoiceService.deleteInvoice(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
