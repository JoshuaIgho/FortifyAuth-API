import Redis from 'ioredis';
import { env } from './env.config';
import { logger } from '../utils/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redis.on('connect', () => logger.info('Redis connection initiated...'));
redis.on('ready', () => logger.info('Redis client ready and synchronized'));
redis.on('reconnecting', (delay) => logger.info(`Redis reconnecting in ${delay}ms...`));
redis.on('error', (err) => logger.error('Redis connection failure:', err));
redis.on('close', () => logger.warn('Redis connection closed'));

export default redis;
