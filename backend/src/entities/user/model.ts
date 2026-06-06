import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  oauthProviders: {
    provider: string;
    externalId: string;
  }[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },
  oauthProviders: [{
    provider: String,
    externalId: String
  }]
}, { timestamps: true });

export const UserModel = model<IUser>('User', UserSchema);
