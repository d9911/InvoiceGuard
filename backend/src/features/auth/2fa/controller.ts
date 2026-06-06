import { Request, Response } from 'express';
import { Enable2FAUseCase } from './enable/useCase';
import { Verify2FAUseCase } from './verify/useCase';

export class TwoFactorController {
  private enableUseCase = new Enable2FAUseCase();
  private verifyUseCase = new Verify2FAUseCase();

  async enable(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const result = await this.enableUseCase.execute(userId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { token } = req.body;
      const result = await this.verifyUseCase.execute(userId, token);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
