import { Money } from '@/shared/lib/money';

describe('Money Utility', () => {
  it('should calculate fee correctly', () => {
    const amount = 10000; // 100.00
    const feePercent = 2.5;
    const fee = Money.calculateFee(amount, feePercent);
    expect(fee).toBe(250); // 2.50
  });

  it('should calculate amount to receive correctly', () => {
    const amount = 10000;
    const fee = 250;
    const amountToReceive = Money.calculateAmountToReceive(amount, fee);
    expect(amountToReceive).toBe(9750);
  });

  it('should handle rounding down for fees', () => {
    const amount = 101; // 1.01
    const feePercent = 2.5;
    // 101 * 0.025 = 2.525 -> 2
    const fee = Money.calculateFee(amount, feePercent);
    expect(fee).toBe(2);
  });
});
