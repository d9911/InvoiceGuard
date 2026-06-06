export class Money {
  /**
   * Safe conversion to minor units.
   * Ensures we are working with integers and handles potential float precision issues.
   */
  static toMinor(amount: number): number {
    if (!Number.isFinite(amount)) throw new Error('Invalid amount: not a finite number');
    // Round to avoid 0.1 + 0.2 = 0.30000000000000004
    return Math.round(amount);
  }

  /**
   * Calculates fee based on integer amount and percentage.
   * Returns floor to stay on the safe side for the merchant/system.
   */
  static calculateFee(amountMinor: number, feePercent: number): number {
    const fee = (amountMinor * feePercent) / 100;
    return Math.floor(this.toMinor(fee));
  }

  static calculateAmountToReceive(amountMinor: number, feeMinor: number): number {
    return amountMinor - feeMinor;
  }
}
