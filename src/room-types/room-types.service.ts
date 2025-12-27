import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomTypeEnum } from '@prisma/client';

@Injectable()
export class RoomTypesService {
  constructor(private prisma: PrismaService) {}

  async createRoomType(data: { nom_type: RoomTypeEnum; description?: string }) {
    return this.prisma.roomType.create({
      data: {
        nom_type: data.nom_type, // must be a RoomTypeEnum
        description: data.description,
      },
    });
  }

  async updateRoomType(
    id: number,
    data: { nom_type?: RoomTypeEnum; description?: string },
  ) {
    return this.prisma.roomType.update({
      where: { id_type: id },
      data: {
        nom_type: data.nom_type,
        description: data.description,
      },
    });
  }

  async deleteRoomType(id: number) {
    return this.prisma.roomType.delete({
      where: { id_type: id },
    });
  }
  // Fetch all room types
  async getAllRoomTypes() {
    return this.prisma.roomType.findMany({ include: { rooms: true } });
  }

  // Fetch a single room type by ID
  async getRoomTypeById(id: number) {
    return this.prisma.roomType.findUnique({ where: { id_type: id } });
  }
}