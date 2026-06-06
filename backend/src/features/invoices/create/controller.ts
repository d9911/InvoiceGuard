import { Request, Response } from 'express';
import { CreateInvoiceUseCase } from './useCase';

export class CreateInvoiceController {
  private useCase = new CreateInvoiceUseCase();

  async handle(req: Request, res: Response) {
    try {
      const { amount, currency, merchantId } = req.body;
      const invoice = await this.useCase.execute({ amount, currency, merchantId });
      return res.status(201).json(invoice);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
