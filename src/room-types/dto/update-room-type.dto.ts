import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomTypeEnum } from '@prisma/client';

export class UpdateRoomTypeDto {
  @IsEnum(RoomTypeEnum)
  @IsOptional()
  nom_type?: RoomTypeEnum;

  @IsString()
  @IsOptional()
  description?: string;
}
