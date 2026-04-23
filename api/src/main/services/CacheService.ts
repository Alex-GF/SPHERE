import dotenv from 'dotenv';
import { RedisClientType } from 'redis';
dotenv.config();

class CacheService {
  private redisClient: RedisClientType | null = null;

  constructor() {}

  setRedisClient(client: RedisClientType) {
    this.redisClient = client;
  }

  async get(key: string) {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    const value = await this.redisClient?.get(key);

    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, expirationInSeconds?: number) {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    const previousValue = await this.redisClient?.get(key);
    if (previousValue && previousValue !== JSON.stringify(value)) {
      throw new Error('Value already exists in cache, please use a different key.');
    }

    await this.redisClient?.set(key, JSON.stringify(value), {
      EX: expirationInSeconds ?? 300,
    });
  }
}

export default CacheService;
