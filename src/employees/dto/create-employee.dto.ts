import { IsInt, IsPositive, IsDateString, IsNumber } from 'class-validator';

export class CreateEmployeeDto {
  @IsInt()
  @IsPositive()
  id_user: number;

  @IsNumber()
  @IsPositive({ message: 'Salary must be positive' })
  salaire: number;

  @IsDateString()
  date_embauche: string;
}
