import { IsInt, IsPositive, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  @IsInt() id_user: number;
  @IsPositive() salaire: number;
  @IsDateString() date_embauche: string;
}
