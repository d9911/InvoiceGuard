import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '@/app/app';
import { MerchantModel } from '@/entities/merchant/model';
import { CryptoLib } from '@/shared/lib/crypto';

jest.mock('@/infrastructure/redis/redis.service', () => {
  const nonces = new Set<string>();
  return {
    redisService: {
      connect: jest.fn().mockResolvedValue(undefined),
      setNonce: jest.fn().mockImplementation(async (nonce: string) => {
        if (nonces.has(nonce)) return false;
        nonces.add(nonce);
        return true;
      }),
    },
  };
});

describe('E2E Financial Flow', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // 1. Setup Merchant
    await MerchantModel.create({
      merchantId: 'm_test_1',
      name: 'Test Merchant',
      feePercent: 2.5,
      webhookSecret: 'secret'
    });

    // 2. Register & Login to get token
    await request(app).post('/api/auth/register').send({ email: 'e2e@test.com', password: 'password123' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'e2e@test.com', password: 'password123' });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('Full Cycle: Create Invoice -> Process Webhook -> Check Status', async () => {
    // 1. Create Invoice
    const invRes = await request(app)
      .post('/api/invoice')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 10000, currency: 'USD', merchantId: 'm_test_1' });
    
    expect(invRes.status).toBe(201);
    const { invoiceId } = invRes.body;

    // 2. Mock Webhook from Payment System
    const payload = JSON.stringify({ invoiceId, status: 'paid' });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = 'unique_nonce_123';
    const signature = CryptoLib.generateHmac(payload, 'secret');

    const webhookRes = await request(app)
      .post('/api/webhook')
      .set('X-Signature', signature)
      .set('X-Timestamp', timestamp)
      .set('X-Nonce', nonce)
      .send({ invoiceId, status: 'paid' });

    expect(webhookRes.status).toBe(200);

    // 3. Verify final status via API
    const finalRes = await request(app)
      .get(`/api/invoice/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(finalRes.body.status).toBe('paid');
  });
});
