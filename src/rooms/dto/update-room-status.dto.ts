import { IsEnum } from 'class-validator';
import { RoomStatus } from '@prisma/client';

export class UpdateRoomStatusDto {
  @IsEnum(RoomStatus)
  statut: RoomStatus;
}
