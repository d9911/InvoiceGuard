import { CryptoUtils } from '../../src/shared/utils/crypto';

describe('Crypto Utility', () => {
  const secret = 'test_secret';
  const payload = JSON.stringify({ invoiceId: '123', status: 'paid' });

  it('should generate a consistent signature', () => {
    const sig1 = CryptoUtils.generateSignature(payload, secret);
    const sig2 = CryptoUtils.generateSignature(payload, secret);
    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64); // SHA256 hex is 64 chars
  });

  it('should verify a valid signature', () => {
    const signature = CryptoUtils.generateSignature(payload, secret);
    const isValid = CryptoUtils.verifySignature(payload, signature, secret);
    expect(isValid).toBe(true);
  });

  it('should reject an invalid signature', () => {
    const isValid = CryptoUtils.verifySignature(payload, 'wrong_signature', secret);
    expect(isValid).toBe(false);
  });
});
