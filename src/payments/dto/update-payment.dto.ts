import {
  IsNumber,
  IsEnum,
  IsPositive,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethod, Prisma } from '@prisma/client';

export class UpdatePaymentDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  montant?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  methode?: PaymentMethod;

  @IsEnum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'])
  @IsOptional()
  status?: string; // PENDING, SUCCESS, FAILED, REFUNDED

  @IsString()
  @IsOptional()
  transactionRef?: string;
}
