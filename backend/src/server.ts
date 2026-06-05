import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './infrastructure/database/mongo';
import { redisService } from './infrastructure/redis/redis.service';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectDB();
    await redisService.connect();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
