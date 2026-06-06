import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { UserModel } from '@/entities/user/model';

export class Enable2FAUseCase {
  async execute(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const secret = speakeasy.generateSecret({
      name: `InvoiceGuard (${user.email})`
    });

    // We store the secret but don't enable 2FA until it's verified
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl
    };
  }
}
