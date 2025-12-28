import {
  IsString,
  IsInt,
  IsNumber,
  IsEnum,
  IsPositive,
  Min,
  IsOptional,
} from 'class-validator';
import { RoomStatus } from '@prisma/client';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  numero?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  etage?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  prix_par_nuit?: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  statut?: RoomStatus; // AVAILABLE ou OUT_OF_SERVICE

  @IsInt()
  @IsPositive()
  @IsOptional()
  id_type?: number;
}
