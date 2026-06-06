import { z } from 'zod';

export const createInvoiceSchema = z.object({
  amount: z.number().positive().int(), // Ensure integer for minor units
  currency: z.string().length(3).transform(val => val.toUpperCase()),
  merchantId: z.string().min(1)
});

export const webhookSchema = z.object({
  invoiceId: z.string().uuid(),
  status: z.enum(['paid', 'failed'])
});
