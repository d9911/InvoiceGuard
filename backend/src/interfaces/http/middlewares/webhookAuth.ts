import { Request, Response, NextFunction } from 'express';
import { CryptoUtils } from '../../../shared/utils/crypto';
import { MerchantModel } from '../../../domain/models/Merchant';
import { InvoiceModel } from '../../../domain/models/Invoice';
import { redisService } from '../../../infrastructure/redis/redis.service';

export const webhookAuth = async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.header('X-Signature') as string;
  const timestamp = req.header('X-Timestamp') as string;
  const nonce = req.header('X-Nonce') as string;

  if (!signature || !timestamp || !nonce) {
    return res.status(401).json({ error: 'Missing security headers' });
  }

  // 1. Check timestamp (e.g., within 5 minutes)
  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) {
    return res.status(401).json({ error: 'Request expired' });
  }

  // 2. Check nonce for replay protection
  const isUnique = await redisService.setNonce(nonce);
  if (!isUnique) {
    return res.status(401).json({ error: 'Duplicate request (nonce)' });
  }

  // 3. Verify signature
  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    return res.status(500).json({ error: 'Raw body not captured' });
  }

  try {
    const body = JSON.parse(rawBody.toString());
    const { invoiceId } = body;
    
    if (!invoiceId) {
      return res.status(400).json({ error: 'invoiceId missing in payload' });
    }

    const invoice = await InvoiceModel.findOne({ invoiceId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const merchant = await MerchantModel.findOne({ merchantId: invoice.merchantId });
    if (!merchant) {
      return res.status(401).json({ error: 'Merchant not found' });
    }

    const isValid = CryptoUtils.verifySignature(rawBody.toString(), signature, merchant.webhookSecret);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  } catch (error) {
    console.error('Webhook auth error:', error);
    return res.status(400).json({ error: 'Invalid payload' });
  }
};
