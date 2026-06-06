import { UserModel } from '@/entities/user/model';
import { AuthProvider } from '@/app/providers/auth.provider';

export class LoginUseCase {
  async execute(email: string, password: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('Auth failed');

    // In reality, use bcrypt.compare
    if (user.passwordHash !== password) throw new Error('Auth failed');

    const token = AuthProvider.sign({ userId: user._id, email: user.email });
    return { token };
  }
}
