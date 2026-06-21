import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis.config';
import { env } from '../config/env.config';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - ioredis type mismatch with rate-limit-redis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  skip: () => env.NODE_ENV === 'test',
});

export const generalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - ioredis type mismatch with rate-limit-redis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  skip: () => env.NODE_ENV === 'test',
});
