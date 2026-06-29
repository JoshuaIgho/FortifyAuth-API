import Redis from 'ioredis';
import { env } from './env.config';
import { logger } from '../utils/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on('connect', () => logger.info('Redis connected successfully'));
redis.on('error', (err) => logger.error('Redis connection failure:', err));

export default redis;
