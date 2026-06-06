import { Request, Response } from 'express';
import { RegisterUseCase } from './useCase';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export class RegisterController {
  private useCase = new RegisterUseCase();

  async handle(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await this.useCase.execute(data);
      return res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}
