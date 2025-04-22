import { bool, cleanEnv, num, port, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    PORT: port(),
    QUEUE_NAME: str(),
    MAX_PARALLEL_JOBS: num(),
    QUEUE_RATE_LIMIT: num(),
    TRIGGER_QUEUES_IN_MS: num(),
    SIMULATE_FAILURE: bool(),
    REDIS_HOST: str(),
    REDIS_PORT: num(),
  });
};

export default validateEnv;
