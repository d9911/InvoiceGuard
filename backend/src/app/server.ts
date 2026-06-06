import * as dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { connectDB } from '@/infrastructure/db/mongoose';
import { redisService } from '@/infrastructure/redis/redis.service';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectDB();
    await redisService.connect();
    
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
