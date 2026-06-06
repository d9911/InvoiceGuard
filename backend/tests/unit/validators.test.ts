import { createInvoiceSchema } from '@/shared/lib/validators';

describe('Validator Unit Tests', () => {
  test('createInvoiceSchema: should validate valid data', () => {
    const validData = { amount: 1000, currency: 'usd', merchantId: 'm1' };
    const result = createInvoiceSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('USD'); // Check transform to uppercase
    }
  });

  test('createInvoiceSchema: should fail on non-integer amount', () => {
    const invalidData = { amount: 10.5, currency: 'USD', merchantId: 'm1' };
    const result = createInvoiceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('createInvoiceSchema: should fail on negative amount', () => {
    const invalidData = { amount: -100, currency: 'USD', merchantId: 'm1' };
    const result = createInvoiceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
