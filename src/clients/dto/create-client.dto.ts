import { IsInt, IsPositive } from 'class-validator';

export class CreateClientDto {
  @IsInt()
  @IsPositive()
  id_user: number;
}
