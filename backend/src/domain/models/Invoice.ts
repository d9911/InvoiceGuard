import { Schema, model, Document } from 'mongoose';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed'
}

export interface IInvoice extends Document {
  invoiceId: string;
  merchantId: string;
  amount: number; // in minor units
  currency: string;
  fee: number;
  amountToReceive: number;
  status: InvoiceStatus;
  paidAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceId: { type: String, required: true, unique: true },
  merchantId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  fee: { type: Number, required: true },
  amountToReceive: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(InvoiceStatus), 
    default: InvoiceStatus.PENDING,
    index: true 
  },
  paidAt: { type: Date },
  version: { type: Number, default: 0 }
}, { timestamps: true });

// Optimistic locking or atomic updates will use version or status check
InvoiceSchema.index({ merchantId: 1, createdAt: -1 });

export const InvoiceModel = model<IInvoice>('Invoice', InvoiceSchema);
