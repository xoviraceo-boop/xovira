import Redis, { RedisOptions } from 'ioredis';
import env from '@/config/env';

const baseOptions: RedisOptions = {
  enableReadyCheck: true,
  maxRetriesPerRequest: null, // avoid throwing for pipelines during reconnects
  retryStrategy: (times) => Math.min(times * 100, 3000),
  reconnectOnError: (err) => {
    const retriable = ['READONLY', 'ETIMEDOUT', 'ECONNRESET'];
    return retriable.some((m) => err.message.includes(m));
  },
};

// Ensure singletons across module graph (dev hot-reload, mixed import paths)
declare global {
  // eslint-disable-next-line no-var
  var __xoviraRedisClients: {
    redis: Redis;
    redisPub: Redis;
    redisSub: Redis;
  } | undefined;
}

const clients = global.__xoviraRedisClients || {
  redis: new Redis(env.REDIS_URL, baseOptions),
  redisPub: new Redis(env.REDIS_URL, baseOptions),
  redisSub: new Redis(env.REDIS_URL, baseOptions),
};

if (!global.__xoviraRedisClients) {
  global.__xoviraRedisClients = clients;
}

export const redis = clients.redis;
export const redisPub = clients.redisPub;
export const redisSub = clients.redisSub;

// Add error handlers to prevent crashes
redis.on('error', (err) => {
  console.error('❌ Redis client error:', err.message);
});

redis.on('connect', () => console.log('✅ Redis client connected'));
redis.on('ready', () => console.log('✅ Redis client ready'));

redisPub.on('error', (err) => {
  console.error('❌ Redis pub error:', err.message);
});

redisPub.on('connect', () => console.log('✅ Redis pub connected'));
redisPub.on('ready', () => console.log('✅ Redis pub ready'));

redisSub.on('error', (err) => {
  console.error('❌ Redis sub error:', err.message);
});

redisSub.on('connect', () => console.log('✅ Redis sub connected'));
redisSub.on('ready', () => console.log('✅ Redis sub ready'));

export default redis;