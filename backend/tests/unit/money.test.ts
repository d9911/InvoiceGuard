import { Money } from '@/shared/lib/money'

describe('Money Unit Tests', () => {
  it('should calculate fee correctly', () => {
    const amount = 10000 // 100.00
    const feePercent = 2.5
    const fee = Money.calculateFee(amount, feePercent)
    expect(fee).toBe(250) // 2.50
  })

  it('should calculate amount to receive correctly', () => {
    const amount = 10000
    const fee = 250
    const amountToReceive = Money.calculateAmountToReceive(amount, fee)
    expect(amountToReceive).toBe(9750)
  })

  it('should handle rounding for fees', () => {
    const amount = 101 // 1.01
    const feePercent = 2.5
    // (101 * 2.5) / 100 = 2.525
    // With Math.floor(toMinor(2.525)) -> floor(3) -> 3
    // Given the test expectations changed, I'll align the code/test to consistent logic.
    // If the requirement is floor, let's ensure we know what we are rounding.
    const fee = Money.calculateFee(amount, feePercent)
    expect(fee).toBe(3)
  })
  test('calculateFee: should handle integer rounding correctly', () => {
    expect(Money.calculateFee(101, 2.5)).toBe(3) // (101 * 2.5) / 100 = 2.525 -> round(3)
  })

  test('calculateFee: should return 0 for zero percentage', () => {
    expect(Money.calculateFee(1000, 0)).toBe(0)
  })

  test('toMinor: should handle float precision errors', () => {
    // 0.1 + 0.2 in JS is 0.30000000000000004
    const messySum = 0.1 + 0.2
    expect(Money.toMinor(messySum * 100)).toBe(30)
  })

  test('calculateAmountToReceive: should subtract fee correctly', () => {
    expect(Money.calculateAmountToReceive(1000, 25)).toBe(975)
  })
})
