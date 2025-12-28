import {
  IsInt,
  IsPositive,
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class CreatePaymentDto {
  @IsInt()
  @IsPositive()
  id_reservation: number;

  @IsNumber()
  @IsPositive({ message: 'Payment amount must be positive' })
  montant: number;

  @IsEnum(PaymentMethod)
  methode: PaymentMethod; // CASH, CARD, BANK_TRANSFER, ONLINE

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus; // PENDING (par défaut), SUCCESS, FAILED, REFUNDED

  @IsString()
  @IsOptional()
  transactionRef?: string; // Référence de transaction

  @IsInt()
  @IsPositive()
  @IsOptional()
  received_by?: number;
}
