import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomTypeEnum } from '@prisma/client';

export class CreateRoomTypeDto {
  @IsEnum(RoomTypeEnum)
  nom_type: RoomTypeEnum;

  @IsString()
  @IsOptional()
  description?: string;
}