import { AuthProvider } from '@/app/providers/auth.provider';

export class RefreshUseCase {
  async execute(userId: string, email: string) {
    const accessToken = AuthProvider.signAccess({ userId, email });
    const refreshToken = AuthProvider.signRefresh({ userId, email });
    return { accessToken, refreshToken };
  }
}
