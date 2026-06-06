import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { InvoiceModel } from '../../src/entities/invoice/model';
import { ProcessWebhookUseCase } from '../../src/features/webhooks/process/useCase';

describe('Webhook Processing Idempotency', () => {
  let mongoServer: MongoMemoryServer;
  let useCase: ProcessWebhookUseCase;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    useCase = new ProcessWebhookUseCase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await InvoiceModel.deleteMany({});
  });

  it('should process webhook once and be idempotent', async () => {
    const invoiceId = 'inv_123';
    await InvoiceModel.create({
      invoiceId,
      merchantId: 'm1',
      amount: 1000,
      currency: 'USD',
      fee: 25,
      amountToReceive: 975,
      status: 'pending',
      version: 0
    });

    const result1 = await useCase.execute(invoiceId, 'paid');
    expect(result1.status).toBe('paid');
    expect(result1.version).toBe(1);

    const result2 = await useCase.execute(invoiceId, 'paid');
    expect(result2.status).toBe('paid');
    expect(result2.version).toBe(1);
  });
});
