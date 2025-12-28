import { Module } from '@nestjs/common';
import { InvoiceService } from './invoices.service';
import { InvoicesController } from './invoices.controller';

@Module({
  providers: [InvoiceService],
  controllers: [InvoicesController],
  exports: [InvoiceService],
})
export class InvoicesModule {}
