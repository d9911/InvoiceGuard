import { Schema, model, Document } from 'mongoose'

export interface IInvoice extends Document {
  invoiceId: string
  merchantId: string
  amount: number
  currency: string
  fee: number
  amountToReceive: number
  status: 'pending' | 'paid' | 'failed'
  version: number
  createdAt: Date
  updatedAt: Date
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceId: { type: String, required: true, unique: true, index: true },
    merchantId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    fee: { type: Number, required: true },
    amountToReceive: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    version: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version',
  },
)

export const InvoiceModel = model<IInvoice>('Invoice', InvoiceSchema)
