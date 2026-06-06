import { InvoiceRepository } from '@/entities/invoice/repository';
import { MerchantModel } from '@/entities/merchant/model';
import { Money } from '@/shared/lib/money';
import { CryptoLib } from '@/shared/lib/crypto';

export class CreateInvoiceUseCase {
  private invoiceRepo = new InvoiceRepository();

  async execute(data: { amount: number; currency: string; merchantId: string }) {
    const merchant = await MerchantModel.findOne({ merchantId: data.merchantId });
    if (!merchant) throw new Error('Merchant not found');

    const fee = Money.calculateFee(data.amount, merchant.feePercent);
    const amountToReceive = Money.calculateAmountToReceive(data.amount, fee);

    return this.invoiceRepo.create({
      invoiceId: CryptoLib.randomUUID(),
      merchantId: data.merchantId,
      amount: data.amount,
      currency: data.currency,
      fee,
      amountToReceive,
      status: 'pending'
    });
  }
}
