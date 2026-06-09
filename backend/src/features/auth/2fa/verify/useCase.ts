import speakeasy from 'speakeasy';
import { UserModel } from '@/entities/user/model';
import { AuthProvider } from '@/app/providers/auth.provider';

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

    // Generate new access and refresh tokens for the user after successful 2FA
    const accessToken = AuthProvider.signAccess({ userId: user._id, email: user.email });
    const refreshToken = AuthProvider.signRefresh({ userId: user._id, email: user.email });
    return { accessToken, refreshToken, email: user.email };
  }
}
