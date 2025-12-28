import { IsArray, ArrayMinSize, IsInt, IsDateString } from 'class-validator';

export class CheckAvailabilityDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  roomIds: number[];

  @IsDateString()
  date_debut: string;

  @IsDateString()
  date_fin: string;
}
