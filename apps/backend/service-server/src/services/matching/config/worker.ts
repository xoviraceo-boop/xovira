import { getRedisConnection } from '@/utils/utilities/getRedisConnection'

export const workerQueueOptions = {
  connection: getRedisConnection(),
  concurrency: 1, // Process one job at a time to avoid overwhelming the system
  limiter: {
    max: 10, // Max 10 jobs
    duration: 60000, // per minute
  },
};
