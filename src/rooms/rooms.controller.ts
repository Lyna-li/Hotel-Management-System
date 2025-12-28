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
import { RoomsService } from './rooms.service';
import { RoomStatus } from '@prisma/client';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(
    @Body()
    body: {
      numero: string;
      etage: number;
      prix_par_nuit: number;
      statut: RoomStatus;
      id_type: number;
    },
  ) {
    try {
      return await this.roomsService.createRoom(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllRooms() {
    return await this.roomsService.getAllRooms();
  }

  @Get('available')
  async getAvailableRooms() {
    return await this.roomsService.getAvailableRooms();
  }

  @Get(':id')
  async getRoomById(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomsService.getRoomById(id);
    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }
    return room;
  }

  @Put(':id')
  async updateRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{
      numero: string;
      etage: number;
      prix_par_nuit: number;
      statut: RoomStatus;
      id_type: number;
    }>,
  ) {
    try {
      return await this.roomsService.updateRoom(id, body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/status')
  async updateRoomStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: RoomStatus,
  ) {
    try {
      return await this.roomsService.updateRoomStatus(id, statut);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async deleteRoom(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.roomsService.deleteRoom(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
