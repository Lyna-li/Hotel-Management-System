import { IsInt, IsPositive } from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  @IsPositive()
  id_reservation: number;
}
