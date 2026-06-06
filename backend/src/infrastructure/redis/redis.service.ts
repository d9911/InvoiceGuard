import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;

  constructor(url: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.client = createClient({ url });
  }

  async connect() {
    if (!this.client.isOpen) await this.client.connect();
  }

  async setNonce(nonce: string, ttl: number = 300): Promise<boolean> {
    const key = `nonce:${nonce}`;
    const result = await this.client.set(key, '1', { NX: true, EX: ttl });
    return result === 'OK';
  }
}

export const redisService = new RedisService();
