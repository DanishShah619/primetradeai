import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';
import { env } from '../config/env';

export const cacheMiddleware = (prefix: string, ttlSeconds = env.CACHE_TTL_SECONDS) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const userId = req.user?.id || 'anonymous';
      // e.g. cache:tasks:usr_123:/api/v1/tasks?page=1
      const cacheKey = `cache:${prefix}:${userId}:${req.originalUrl}`;

      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedData));
      }

      res.setHeader('X-Cache', 'MISS');

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.setex(cacheKey, ttlSeconds, JSON.stringify(body)).catch((err) => {
            // Log but don't fail the request
            console.error('Redis cache set error:', err);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      // Fail open if Redis is down
      next();
    }
  };
};

export const invalidateUserCache = async (prefix: string, userId: string) => {
  try {
    const pattern = `cache:${prefix}:${userId}:*`;
    // Use SCAN or KEYS. Since this is per-user and per-prefix, KEYS might be acceptable
    // but SCAN is safer for production. For simplicity in this demo, we'll use keys
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error:', err);
  }
};
