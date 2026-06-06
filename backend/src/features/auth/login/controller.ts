import { Request, Response } from 'express';
import { LoginUseCase } from './useCase';

export class LoginController {
  private useCase = new LoginUseCase();

  async handle(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.useCase.execute(email, password);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}
