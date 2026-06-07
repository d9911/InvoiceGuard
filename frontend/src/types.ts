export interface IUser {
  email: string
  isTwoFactorEnabled?: boolean
  lastLoginAt?: string
}

export interface IInvoice {
  invoiceId: string
  merchantId: string
  amount: number // in cents/minor units
  currency: string
  fee: number // in cents
  amountToReceive: number // in cents
  status: 'pending' | 'paid' | 'failed'
  createdAt?: string
  updatedAt?: string
}

export interface IMerchant {
  merchantId: string
  name: string
  feePercent: number
  webhookSecret: string
}

export interface IAuthResponse {
  token?: string
  email?: string
  requires2FA?: boolean
  tempToken?: string
}

export interface I2FASetupResponse {
  secret: string
  qrCode: string // DataURI img element source
}
