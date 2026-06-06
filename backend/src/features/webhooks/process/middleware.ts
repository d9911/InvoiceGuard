import { Request, Response, NextFunction } from 'express';
import { CryptoLib } from '@/shared/lib/crypto';
import { MerchantModel } from '@/entities/merchant/model';
import { redisService } from '@/infrastructure/redis/redis.service';

export const webhookSecurityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.header('X-Signature');
  const timestamp = req.header('X-Timestamp');
  const nonce = req.header('X-Nonce');

  if (!signature || !timestamp || !nonce) {
    return res.status(401).json({ error: 'Missing security headers' });
  }

  // Time window check (5 min)
  if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp)) > 300) {
    return res.status(401).json({ error: 'Timestamp expired' });
  }

  // Nonce check in Redis
  const isUnique = await redisService.setNonce(nonce);
  if (!isUnique) return res.status(401).json({ error: 'Duplicate request' });

  // HMAC verification
  const { invoiceId } = req.body;
  const { InvoiceRepository } = require('@/entities/invoice/repository');
  const invoiceRepo = new InvoiceRepository();
  const invoice = await invoiceRepo.findByInvoiceId(invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const merchant = await MerchantModel.findOne({ merchantId: invoice.merchantId });
  if (!merchant || !CryptoLib.verifyHmac((req as any).rawBody.toString(), signature, merchant.webhookSecret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};
