import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  email: string
  username: string
  nickname: string
  passwordHash: string
  twoFactorSecret?: string
  isTwoFactorEnabled: boolean
  failedLoginAttempts: number
  lockUntil?: Date
  lastLoginAt?: Date
  comparePassword: (password: string) => Promise<boolean>
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    nickname: { type: String, required: true },
    passwordHash: { type: String, required: true },
    twoFactorSecret: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
)

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash)
}

export const UserModel = model<IUser>('User', UserSchema)
