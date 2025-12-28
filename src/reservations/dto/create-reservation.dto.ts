import {
  IsInt,
  IsPositive,
  IsArray,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @IsPositive()
  id_client: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one room must be reserved' })
  @IsInt({ each: true })
  roomIds: number[];

  @IsDateString()
  date_debut: string;

  @IsDateString()
  date_fin: string;
}
