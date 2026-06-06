import { CryptoLib } from '../../src/shared/lib/crypto';

describe('Crypto Utility', () => {
  const secret = 'test_secret';
  const payload = JSON.stringify({ invoiceId: '123', status: 'paid' });

  it('should generate a consistent signature', () => {
    const sig1 = CryptoLib.generateHmac(payload, secret);
    const sig2 = CryptoLib.generateHmac(payload, secret);
    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64);
  });

  it('should verify a valid signature', () => {
    const signature = CryptoLib.generateHmac(payload, secret);
    const isValid = CryptoLib.verifyHmac(payload, signature, secret);
    expect(isValid).toBe(true);
  });
});
