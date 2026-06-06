export class Money {
  static toMinor(amount: number): number {
    return Math.round(amount);
  }

  static calculateFee(amount: number, feePercent: number): number {
    return Math.floor((amount * feePercent) / 100);
  }

  static calculateAmountToReceive(amount: number, fee: number): number {
    return amount - fee;
  }
}
