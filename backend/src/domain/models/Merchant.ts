import { Schema, model, Document } from 'mongoose';

export interface IMerchant extends Document {
  merchantId: string;
  name: string;
  feePercent: number;
  webhookSecret: string;
  createdAt: Date;
  updatedAt: Date;
}

const MerchantSchema = new Schema<IMerchant>({
  merchantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  feePercent: { type: Number, required: true, default: 0 },
  webhookSecret: { type: String, required: true },
}, { timestamps: true });

export const MerchantModel = model<IMerchant>('Merchant', MerchantSchema);
