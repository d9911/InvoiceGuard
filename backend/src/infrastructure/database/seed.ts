import mongoose from 'mongoose';
import { MerchantModel } from '../../domain/models/Merchant';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-guard';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    await MerchantModel.deleteMany({});
    
    const merchant = await MerchantModel.create({
      merchantId: 'merchant_123',
      name: 'Test Merchant',
      feePercent: 2.5,
      webhookSecret: 'super_secret_key'
    });

    console.log('Seed completed successfully');
    console.log('Test Merchant:', merchant);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
