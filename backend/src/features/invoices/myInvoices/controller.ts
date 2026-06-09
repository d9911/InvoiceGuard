import { Request, Response } from 'express';
import { InvoiceRepository } from '@/entities/invoice/repository';
const invoiceRepo = new InvoiceRepository();

export class MyInvoicesController {

  async handle(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        return res.status(401).json({ error: 'Invalid token payload' });
      }

      const invoices = await invoiceRepo.findByMerchantId(user.userId);
      res.json({ invoices });
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      res.status(500).json({ error: err.message ?? 'Failed to retrieve invoices' });
    }
  }
}
