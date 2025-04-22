import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const HAS_CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  MAX_PARALLEL_JOBS,
  QUEUE_NAME,
  QUEUE_RATE_LIMIT,
  TRIGGER_QUEUES_IN_MS,
  SIMULATE_FAILURE,
  REDIS_HOST,
} = process.env;
