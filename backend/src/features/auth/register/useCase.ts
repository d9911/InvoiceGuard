import { UserModel } from '@/entities/user/model';
import { AuthProvider } from '@/app/providers/auth.provider';
import bcrypt from 'bcrypt';

export class RegisterUseCase {
  async execute(data: { email: string; password: string }) {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) throw new Error('User already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await UserModel.create({
      email: data.email,
      passwordHash
    });

    const accessToken = AuthProvider.signAccess({ userId: user._id, email: user.email });
    const refreshToken = AuthProvider.signRefresh({ userId: user._id, email: user.email });
    return { accessToken, refreshToken, email: user.email };
  }
}
