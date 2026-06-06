import { InvoiceModel, IInvoice } from './model';

export class InvoiceRepository {
  async findByInvoiceId(invoiceId: string): Promise<IInvoice | null> {
    return InvoiceModel.findOne({ invoiceId });
  }

  async create(data: Partial<IInvoice>): Promise<IInvoice> {
    return InvoiceModel.create(data);
  }

  async updateStatus(invoiceId: string, status: string): Promise<IInvoice | null> {
    return InvoiceModel.findOneAndUpdate(
      { invoiceId, status: 'pending' },
      { $set: { status }, $inc: { version: 1 } },
      { returnDocument: 'after' }
    );
  }
}
