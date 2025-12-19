import Redis, { RedisOptions } from 'ioredis';
import env from '@/config/env';

export function getRedisConnection() {
  if (env.REDIS_URL.includes('://')) {
    const url = new URL(env.REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      ...(url.protocol === 'rediss:' && { tls: {} }),
    };
  }
  return {
    host: 'localhost',
    port: 6379,
  };
}