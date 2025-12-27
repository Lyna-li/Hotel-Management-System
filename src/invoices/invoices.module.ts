import { Module } from '@nestjs/common';
import { InvoiceService } from './invoices.service';

@Module({
  providers: [InvoiceService]
})
export class InvoicesModule {}
