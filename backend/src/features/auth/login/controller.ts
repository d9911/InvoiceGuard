import { Request, Response } from 'express';
import { LoginUseCase } from './useCase';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export class LoginController {
  private useCase = new LoginUseCase();

  async handle(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      // Pass data as a single object to match useCase.execute(data: { email, password })
      const result = await this.useCase.execute(data);
      return res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      return res.status(401).json({ error: error.message });
    }
  }
}
