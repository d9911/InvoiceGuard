import { Request, Response, NextFunction } from 'express';
import { CryptoLib } from '@/shared/lib/crypto';
import { MerchantModel } from '@/entities/merchant/model';
import { InvoiceRepository } from '@/entities/invoice/repository';
import { redisService } from '@/infrastructure/redis/redis.service';

/**
 * Webhook Security Middleware
 * 1. Validates presence of X-Signature, X-Timestamp, X-Nonce
 * 2. Validates timestamp (window: 5 minutes) to prevent replay
 * 3. Validates Nonce uniqueness using Redis
 * 4. Verifies HMAC-SHA256 signature using raw body
 */
export const webhookSecurityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.header('X-Signature');
  const timestamp = req.header('X-Timestamp');
  const nonce = req.header('X-Nonce');

  // 1. Check required headers
  if (!signature || !timestamp || !nonce) {
    return res.status(401).json({ error: 'Security headers missing (Signature, Timestamp, Nonce)' });
  }

  // 2. Validate timestamp (window: 5 minutes)
  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return res.status(401).json({ error: 'Request expired or invalid timestamp' });
  }

  // 3. Prevent Replay Attacks using Nonce in Redis
  const isUnique = await redisService.setNonce(nonce);
  if (!isUnique) {
    return res.status(401).json({ error: 'Duplicate request detected (Nonce replay)' });
  }

  // 4. Capture raw body for signature verification
  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    return res.status(500).json({ error: 'Internal error: raw body not captured' });
  }

  try {
    const body = JSON.parse(rawBody.toString());
    const { invoiceId } = body;

    if (!invoiceId) {
      return res.status(400).json({ error: 'invoiceId missing in payload' });
    }

    // 5. Look up Invoice and Merchant to get the secret
    const invoiceRepo = new InvoiceRepository();
    const invoice = await invoiceRepo.findByInvoiceId(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const merchant = await MerchantModel.findOne({ merchantId: invoice.merchantId });
    if (!merchant) {
      return res.status(401).json({ error: 'Merchant associated with invoice not found' });
    }

    // 6. Verify HMAC-SHA256
    const isValid = CryptoLib.verifyHmac(rawBody.toString(), signature, merchant.webhookSecret);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    next();
  } catch (error) {
    console.error('Webhook security verification failed:', error);
    return res.status(400).json({ error: 'Security verification failed' });
  }
};
