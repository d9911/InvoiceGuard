import { InvoiceRepository } from '@/entities/invoice/repository';

export class MyInvoicesUseCase {
  private repo = new InvoiceRepository();

  async execute(userId: string) {
    // Assuming merchantId corresponds to the user's ID for invoices
    const invoices = await this.repo.findByMerchantId(userId);
    return invoices;
  }
}
