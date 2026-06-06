import mongoose from 'mongoose';
import { MerchantModel } from '../../entities/merchant/model';
import { UserModel } from '../../entities/user/model';
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

    await UserModel.create({
      email: 'admin@example.com',
      passwordHash: 'password123', // In prod, use bcrypt
    });

    console.log('Seed success');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
