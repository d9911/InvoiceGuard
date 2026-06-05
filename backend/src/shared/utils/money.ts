/**
 * Utility for monetary calculations to avoid floating point issues.
 * All amounts should be handled as integers (e.g., in cents or minor units).
 */
export class Money {
  /**
   * Calculates fee based on amount and fee percent.
   * @param amount - Amount in minor units (e.g., cents)
   * @param feePercent - Fee percent (e.g., 2.5 for 2.5%)
   * @returns fee in minor units (rounded down)
   */
  static calculateFee(amount: number, feePercent: number): number {
    return Math.floor((amount * feePercent) / 100);
  }

  /**
   * Calculates amount to receive.
   */
  static calculateAmountToReceive(amount: number, fee: number): number {
    return amount - fee;
  }
}
