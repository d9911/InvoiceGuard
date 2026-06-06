import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { InvoiceRepository } from '@/entities/invoice/repository';
import { InvoiceModel } from '@/entities/invoice/model';

describe('Invoice Repository Integration', () => {
  let mongoServer: MongoMemoryServer;
  const repo = new InvoiceRepository();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('create: should save invoice correctly', async () => {
    const data = { invoiceId: 'inv-1', merchantId: 'm1', amount: 100, currency: 'USD', fee: 2, amountToReceive: 98 };
    const saved = await repo.create(data);
    expect(saved.invoiceId).toBe('inv-1');
    expect(saved.status).toBe('pending');
  });

  test('updateStatus: should increment version and change status', async () => {
    const inv = await InvoiceModel.create({ invoiceId: 'inv-2', merchantId: 'm1', amount: 100, currency: 'USD', fee: 2, amountToReceive: 98, status: 'pending', version: 0 });
    const updated = await repo.updateStatus('inv-2', 'paid');
    expect(updated?.status).toBe('paid');
    expect(updated?.version).toBe(1);
  });

  test('updateStatus: should not update if status is not pending (idempotency)', async () => {
    await InvoiceModel.create({ invoiceId: 'inv-3', merchantId: 'm1', amount: 100, currency: 'USD', fee: 2, amountToReceive: 98, status: 'paid', version: 1 });
    const result = await repo.updateStatus('inv-3', 'failed');
    expect(result).toBeNull(); // findOneAndUpdate with status: 'pending' won't find it
  });
});
