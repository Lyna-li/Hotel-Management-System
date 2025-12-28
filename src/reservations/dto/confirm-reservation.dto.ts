import { IsInt, IsPositive } from 'class-validator';

export class ConfirmReservationDto {
  @IsInt()
  @IsPositive()
  employeeId: number;
}
