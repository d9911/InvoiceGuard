import { InvoiceRepository } from '@/entities/invoice/repository';

export class ProcessWebhookUseCase {
  private invoiceRepo = new InvoiceRepository();

  async execute(invoiceId: string, status: 'paid' | 'failed') {
    const result = await this.invoiceRepo.updateStatus(invoiceId, status);

    if (!result) {
      const existing = await this.invoiceRepo.findByInvoiceId(invoiceId);
      if (!existing) throw new Error('Invoice not found');
      return existing;
    }

    return result;
  }
}
