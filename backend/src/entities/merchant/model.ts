import { Schema, model, Document } from 'mongoose'

export interface IMerchant extends Document {
  merchantId: string
  name: string
  feePercent: number
  webhookSecret: string
  ownerId?: Schema.Types.ObjectId
}

const MerchantSchema = new Schema<IMerchant>(
  {
    merchantId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    feePercent: { type: Number, required: true },
    webhookSecret: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  },
  { timestamps: true },
)

export const MerchantModel = model<IMerchant>('Merchant', MerchantSchema)
