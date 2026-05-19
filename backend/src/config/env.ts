import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CACHE_TTL_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_CAPACITY: z.coerce.number().default(60),
  RATE_LIMIT_REFILL_PER_SEC: z.coerce.number().default(1),
  AUTH_RATE_LIMIT_CAPACITY: z.coerce.number().default(10),
  AUTH_RATE_LIMIT_REFILL_PER_SEC: z.coerce.number().default(0.1),
});

export const env = envSchema.parse(process.env);
