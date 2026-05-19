import { Redis } from 'ioredis';
import { env } from './config/env';
import { logger } from './utils/logger';

// Singleton Redis client
const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

if (env.NODE_ENV !== 'production') globalForRedis.redis = redis;

redis.on('error', (err) => {
  logger.error(err, 'Redis Client Error');
});

redis.on('connect', () => {
  logger.info('Redis Client Connected');
});
