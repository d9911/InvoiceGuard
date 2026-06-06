import crypto from 'crypto';

export class CryptoLib {
  static generateHmac(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  static verifyHmac(payload: string, signature: string, secret: string): boolean {
    const expected = this.generateHmac(payload, secret);
    try {
      return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
      return false;
    }
  }

  static randomUUID(): string {
    return crypto.randomUUID();
  }
}
