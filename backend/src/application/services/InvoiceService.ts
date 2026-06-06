import { InvoiceModel, InvoiceStatus, IInvoice } from '../../domain/models/Invoice';
import { MerchantModel } from '../../domain/models/Merchant';
import { Money } from '../../shared/utils/money';
//  CommonJS compatibility with uuid v8
const uuid = require('uuid');
const uuidv4 = uuid.v4;

export class InvoiceService {
  async createInvoice(data: { amount: number; currency: string; merchantId: string }) {
    const { amount, currency, merchantId } = data;

    const merchant = await MerchantModel.findOne({ merchantId });
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    const fee = Money.calculateFee(amount, merchant.feePercent);
    const amountToReceive = Money.calculateAmountToReceive(amount, fee);

    const invoice = new InvoiceModel({
      invoiceId: uuidv4(),
      merchantId,
      amount,
      currency,
      fee,
      amountToReceive,
      status: InvoiceStatus.PENDING,
    });

    await invoice.save();
    return invoice;
  }

  async getInvoice(invoiceId: string) {
    return InvoiceModel.findOne({ invoiceId });
  }

  async processWebhook(invoiceId: string, status: 'paid' | 'failed') {
    const targetStatus = status === 'paid' ? InvoiceStatus.PAID : InvoiceStatus.FAILED;

    // Atomic update to prevent race conditions and ensure idempotency
    // Only update if current status is PENDING
    const result = await InvoiceModel.findOneAndUpdate(
      {
        invoiceId,
        status: InvoiceStatus.PENDING
      },
      {
        $set: {
          status: targetStatus,
          paidAt: targetStatus === InvoiceStatus.PAID ? new Date() : undefined
        },
        $inc: { version: 1 }
      },
      { new: true }
    );

    if (!result) {
      // Check if it was already processed
      const existingInvoice = await InvoiceModel.findOne({ invoiceId });
      if (!existingInvoice) {
        throw new Error('Invoice not found');
      }

      // If status is already what we wanted (or already finalized), we return it (idempotency)
      return existingInvoice;
    }

    return result;
  }
}

export const invoiceService = new InvoiceService();
