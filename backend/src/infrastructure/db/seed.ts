import mongoose from 'mongoose';
import { MerchantModel } from '@/entities/merchant/model';
import { UserModel } from '@/entities/user/model';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-guard';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    await MerchantModel.deleteMany({});
    await UserModel.deleteMany({});

    await MerchantModel.create({
      merchantId: 'merchant_123',
      name: 'Test Merchant',
      feePercent: 2.5,
      webhookSecret: 'super_secret_key'
    });

    const passwordHash = await bcrypt.hash('password123', 10);
    await UserModel.create({
      email: 'admin@example.com',
      passwordHash: passwordHash
    });

    console.log('Seed success');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
