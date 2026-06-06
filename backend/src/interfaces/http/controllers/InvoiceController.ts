import { Request, Response } from 'express';
import { invoiceService } from '../../../application/services/InvoiceService';

export class InvoiceController {
  async create(req: Request, res: Response) {
    try {
      const { amount, currency, merchantId } = req.body;
      if (amount === undefined || !currency || !merchantId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const invoice = await invoiceService.createInvoice({ 
        amount: Number(amount), 
        currency: currency as string, 
        merchantId: merchantId as string 
      });
      return res.status(201).json({
        invoiceId: invoice.invoiceId,
        amount: invoice.amount,
        fee: invoice.fee,
        amountToReceive: invoice.amountToReceive,
        status: invoice.status,
        currency: invoice.currency
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const invoice = await invoiceService.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      return res.json(invoice);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async webhook(req: Request, res: Response) {
    try {
      const invoiceId = req.body.invoiceId as string;
      const status = req.body.status as 'paid' | 'failed';
      
      if (!invoiceId || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const invoice = await invoiceService.processWebhook(invoiceId, status);
      return res.json({ 
        message: 'Webhook processed', 
        invoiceId: invoice.invoiceId, 
        status: invoice.status 
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export const invoiceController = new InvoiceController();
