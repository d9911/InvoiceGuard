import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server'; // I should add this to devDeps
import { InvoiceModel, InvoiceStatus } from '../../src/domain/models/Invoice';
import { MerchantModel } from '../../src/domain/models/Merchant';
import { InvoiceService } from '../../src/application/services/InvoiceService';

describe('Webhook Processing Idempotency', () => {
  let mongoServer: MongoMemoryServer;
  let invoiceService: InvoiceService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    invoiceService = new InvoiceService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await InvoiceModel.deleteMany({});
    await MerchantModel.deleteMany({});
  });

  it('should process webhook once and be idempotent on second call', async () => {
    const invoiceId = 'inv_123';
    await InvoiceModel.create({
      invoiceId,
      merchantId: 'm1',
      amount: 1000,
      currency: 'USD',
      fee: 25,
      amountToReceive: 975,
      status: InvoiceStatus.PENDING,
      version: 0
    });

    // First call
    const result1 = await invoiceService.processWebhook(invoiceId, 'paid');
    expect(result1.status).toBe(InvoiceStatus.PAID);
    expect(result1.version).toBe(1);

    // Second call (same status)
    const result2 = await invoiceService.processWebhook(invoiceId, 'paid');
    expect(result2.status).toBe(InvoiceStatus.PAID);
    expect(result2.version).toBe(1); // Should NOT have incremented version
  });

  it('should not allow failing a paid invoice', async () => {
    const invoiceId = 'inv_456';
    await InvoiceModel.create({
      invoiceId,
      merchantId: 'm1',
      amount: 1000,
      currency: 'USD',
      fee: 25,
      amountToReceive: 975,
      status: InvoiceStatus.PAID,
      version: 1
    });

    const result = await invoiceService.processWebhook(invoiceId, 'failed');
    expect(result.status).toBe(InvoiceStatus.PAID); // Remained PAID
    expect(result.version).toBe(1);
  });
});
