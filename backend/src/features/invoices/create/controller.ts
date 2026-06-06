import { Request, Response } from 'express';
import { CreateInvoiceUseCase } from './useCase';
import { createInvoiceSchema } from '@/shared/lib/validators';
import { z } from 'zod';
import { Logger } from '@/infrastructure/logger';

export class CreateInvoiceController {
  private useCase = new CreateInvoiceUseCase();

  async handle(req: Request, res: Response) {
    try {
      const data = createInvoiceSchema.parse(req.body);
      const invoice = await this.useCase.execute(data);
      
      Logger.info(`Invoice created: ${invoice.invoiceId} for merchant: ${data.merchantId}`);
      
      return res.status(201).json(invoice);
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
      
      Logger.error(`Invoice creation failed`, error);
      return res.status(400).json({ error: error.message });
    }
  }
}
