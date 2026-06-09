// backend/src/features/auth/refresh/controller.ts
import { Request, Response } from 'express';
import { AuthProvider } from '@/app/providers/auth.provider';

/**
 * Controller for refreshing the short‑lived access token using a long‑lived refresh token.
 * Expected request body: { refreshToken: string }
 * Returns: { accessToken: string }
 */
export class RefreshController {
  async handle(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken is required' });
      }
      // Verify the refresh token (it was signed with the same secret but 30d expiry)
      const payload = AuthProvider.verify(refreshToken);
      // Issue a new short‑lived access token
      const accessToken = AuthProvider.signAccess({ userId: payload.userId, email: payload.email });
      res.json({ accessToken });
    } catch (err: any) {
      // Token verification failed or other error
      return res.status(401).json({ error: err.message ?? 'Invalid refresh token' });
    }
  }
}
