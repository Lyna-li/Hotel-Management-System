import {
  IsString,
  IsInt,
  IsNumber,
  IsEnum,
  IsPositive,
  Min,
} from 'class-validator';
import { RoomStatus } from '@prisma/client';

export class CreateRoomDto {
  @IsString()
  numero: string;

  @IsInt()
  @Min(0, { message: 'Floor must be 0 or higher' })
  etage: number;

  @IsNumber()
  @IsPositive({ message: 'Price must be positive' })
  prix_par_nuit: number;

  @IsEnum(RoomStatus)
  statut: RoomStatus;

  @IsInt()
  @IsPositive()
  id_type: number;
}
