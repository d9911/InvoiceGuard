import { UserModel } from '@/entities/user/model';
import { AuthProvider } from '@/app/providers/auth.provider';

export class LoginUseCase {
  async execute(data: { email: string; password: string }) {
    const user = await UserModel.findOne({ email: data.email });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) throw new Error('Invalid credentials');

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    if (user.isTwoFactorEnabled) {
      return { 
        requires2FA: true, 
        tempToken: AuthProvider.sign({ userId: user._id, email: user.email, isPending2FA: true }) 
      };
    }

    const token = AuthProvider.sign({ userId: user._id, email: user.email });
    return { token, email: user.email };
  }
}
