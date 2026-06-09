import jwt from 'jsonwebtoken';

export class AuthProvider {
  private static secret = process.env.JWT_SECRET || 'jwt_secret';

  static signAccess(payload: any): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1h' });
  }

  static signRefresh(payload: any): string {
    return jwt.sign(payload, this.secret, { expiresIn: '30d' });
  }

  static verify(token: string): any {
    return jwt.verify(token, this.secret);
  }
}
