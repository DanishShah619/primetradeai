import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

// Lua script for atomic Token Bucket rate limiting
const TOKEN_BUCKET_SCRIPT = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refill_rate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])

  local bucket = redis.call("HMGET", key, "tokens", "last_update")
  local tokens = tonumber(bucket[1])
  local last_update = tonumber(bucket[2])

  if not tokens then
    tokens = capacity
    last_update = now
  else
    local elapsed = math.max(0, now - last_update)
    tokens = math.min(capacity, tokens + elapsed * refill_rate)
  end

  if tokens >= 1 then
    tokens = tokens - 1
    redis.call("HMSET", key, "tokens", tokens, "last_update", now)
    redis.call("EXPIRE", key, math.ceil(capacity / refill_rate))
    return {1, tostring(tokens)}
  else
    redis.call("HMSET", key, "tokens", tokens, "last_update", now)
    redis.call("EXPIRE", key, math.ceil(capacity / refill_rate))
    return {0, tostring(tokens)}
  end
`;

export const createRateLimiter = (prefix: string, capacity: number, refillPerSec: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
      const key = `ratelimit:${prefix}:${ip}`;
      const now = Math.floor(Date.now() / 1000);

      // Execute Lua script
      const result = await redis.eval(
        TOKEN_BUCKET_SCRIPT,
        1, // number of keys
        key,
        capacity,
        refillPerSec,
        now
      ) as [number, string];

      const allowed = result[0] === 1;
      const remainingTokens = parseFloat(result[1]);

      res.setHeader('X-RateLimit-Limit', capacity);
      res.setHeader('X-RateLimit-Remaining', Math.floor(remainingTokens));

      if (!allowed) {
        return next(new ApiError(429, 'Too many requests, please try again later.'));
      }

      next();
    } catch (err) {
      // Fail open if Redis is down
      next();
    }
  };
};

export const globalRateLimiter = createRateLimiter(
  'global',
  env.RATE_LIMIT_CAPACITY,
  env.RATE_LIMIT_REFILL_PER_SEC
);

export const authRateLimiter = createRateLimiter(
  'auth',
  env.AUTH_RATE_LIMIT_CAPACITY,
  env.AUTH_RATE_LIMIT_REFILL_PER_SEC
);
