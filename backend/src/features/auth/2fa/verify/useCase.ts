import speakeasy from 'speakeasy';
import { UserModel } from '@/entities/user/model';

export class Verify2FAUseCase {
  async execute(userId: string, token: string) {
    const user = await UserModel.findById(userId);
    if (!user || !user.twoFactorSecret) throw new Error('2FA not initiated');

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) throw new Error('Invalid 6-digit code');

    user.isTwoFactorEnabled = true;
    await user.save();

    return { success: true, message: '2FA enabled successfully' };
  }
}
