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
import { RoomTypesService } from './room-types.service';
import { RoomTypeEnum } from '@prisma/client';

@Controller('room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Post()
  async createRoomType(
    @Body() body: { nom_type: RoomTypeEnum; description?: string },
  ) {
    try {
      return await this.roomTypesService.createRoomType(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllRoomTypes() {
    return await this.roomTypesService.getAllRoomTypes();
  }

  @Get(':id')
  async getRoomTypeById(@Param('id', ParseIntPipe) id: number) {
    const roomType = await this.roomTypesService.getRoomTypeById(id);
    if (!roomType) {
      throw new HttpException('Room type not found', HttpStatus.NOT_FOUND);
    }
    return roomType;
  }

  @Put(':id')
  async updateRoomType(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      nom_type?: RoomTypeEnum;
      description?: string;
    },
  ) {
    try {
      return await this.roomTypesService.updateRoomType(id, body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async deleteRoomType(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.roomTypesService.deleteRoomType(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
