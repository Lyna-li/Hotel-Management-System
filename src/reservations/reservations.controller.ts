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
  Put,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async createReservation(
    @Body()
    body: {
      id_client: number;
      roomIds: number[];
      date_debut: string;
      date_fin: string;
    },
  ) {
    try {
      return await this.reservationsService.createReservation({
        id_client: body.id_client,
        roomIds: body.roomIds,
        date_debut: new Date(body.date_debut),
        date_fin: new Date(body.date_fin),
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllReservations() {
    return await this.reservationsService.getAllReservations();
  }

  @Get(':id')
  async getReservationById(@Param('id', ParseIntPipe) id: number) {
    const reservation = await this.reservationsService.getReservationById(id);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    return reservation;
  }

  @Put(':id/confirm')
  async confirmReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body('employeeId', ParseIntPipe) employeeId: number,
  ) {
    try {
      return await this.reservationsService.confirmReservation(id, employeeId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/finish')
  async finishReservation(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.reservationsService.finishReservation(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async deleteReservation(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.reservationsService.deleteReservation(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('check-availability')
  async checkRoomAvailability(
    @Body() body: { roomIds: number[]; date_debut: string; date_fin: string },
  ) {
    try {
      await this.reservationsService.checkRoomAvailability(
        body.roomIds,
        new Date(body.date_debut),
        new Date(body.date_fin),
      );
      return {
        available: true,
        message: 'Rooms are available for this date range',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }
}
