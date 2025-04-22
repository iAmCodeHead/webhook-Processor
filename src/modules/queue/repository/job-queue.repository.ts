import { DLQ_KEY, FAILED_KEY, PENDING_KEY, PROCESSED_KEY } from '../../../constants/queue.constant';
import { RedisClientType } from '@/utils/redis';
import { Job } from '@/interfaces/shared-job.interface';
import { MetricsRepository } from '@/modules/metrics/repository/metrics.repository';

export class QueueRepository {

private readonly redis: RedisClientType;
private readonly metrics: MetricsRepository;

  constructor(redisClient: RedisClientType) {
    this.redis = redisClient;
    this.metrics = new MetricsRepository(redisClient);
  }

  public async enqueuePending(job: Job): Promise<void> {
    await this.redis.rpush(PENDING_KEY, JSON.stringify(job));
    this.metrics.incrementRequestReceived();
  }

  public async dequeuePending(): Promise<Job | null> {
    const jobStr = await this.redis.lpop(PENDING_KEY);
    return jobStr ? JSON.parse(jobStr) : null;
  }
  
  public async enqueueSuccessful(job: Job): Promise<Job> {
    const updatedJob = this.updateAttempt(job);
    await this.redis.rpush(PROCESSED_KEY, JSON.stringify(updatedJob));
    await this.metrics.incrementProcessedJob();
    return updatedJob;
  }

  public async enqueueFailed(job: Job): Promise<Job> {
    const updatedJob = this.updateAttempt(job);
    await this.redis.rpush(FAILED_KEY, JSON.stringify(updatedJob));
    this.metrics.incrementFailedProcesses();
    return updatedJob;
  }

  public async dequeueFailed(): Promise<Job | null> {
    const jobStr = await this.redis.rpop(FAILED_KEY);
    return jobStr ? JSON.parse(jobStr) : null;
  }

  public async populateDLQ(job: Job): Promise<Job> {
    const updatedJob = this.updateAttempt(job);
    await this.redis.rpush(DLQ_KEY, JSON.stringify(updatedJob));
    return updatedJob;
  }

  public async getDlqQueueLength(): Promise<number> {
    return await this.redis.llen(DLQ_KEY);
  }
  
  private updateAttempt(job: Job): Job {
    return { ...job, attempts: job.attempts + 1 };
  }

}
// const redis = createRedisClient()

// export async function enqueuePending(job: Job): Promise<void> {
//   await this.redis.rpush(PENDING_KEY, JSON.stringify(job));
//   incrementRequestReceived();
// }

// export async function dequeuePending(): Promise<Job | null> {
//   const jobStr = await this.redis.lpop(PENDING_KEY);
//   return jobStr ? JSON.parse(jobStr) : null;
// }

// export async function enqueueSuccessful(job: Job): Promise<Job> {
//   const updatedJob = updateAttempt(job);
//   await this.redis.rpush(PROCESSED_KEY, JSON.stringify(updatedJob));
//   await incrementProcessedJob();
//   return updatedJob;
// }

// export async function enqueueFailed(job: Job): Promise<Job> {
//   const updatedJob = updateAttempt(job);
//   await this.redis.rpush(FAILED_KEY, JSON.stringify(updatedJob));
//   incrementFailedProcesses();
//   return updatedJob;
// }

// export async function dequeueFailed(): Promise<Job | null> {
//   const jobStr = await this.redis.rpop(FAILED_KEY);
//   return jobStr ? JSON.parse(jobStr) : null;
// }

// export async function populateDLQ(job: Job): Promise<Job> {
//   const updatedJob = updateAttempt(job);
//   await this.redis.rpush(DLQ_KEY, JSON.stringify(updatedJob));
//   return updatedJob;
// }

// export async function getDlqQueueLength(): Promise<number> {
//   return await this.redis.llen(DLQ_KEY);
// }

// export async function getPendingQueueLength(): Promise<number> {
//   return await this.redis.llen(PENDING_KEY);
// }

// export async function getProccessedQueueLength(): Promise<number> {
//   return await this.redis.llen(PROCESSED_KEY);
// }

// export async function getFailedQueueLength(): Promise<number> {
//   return await this.redis.llen(FAILED_KEY);
// }

// function updateAttempt(job: Job): Job {
//   return { ...job, attempts: job.attempts + 1 };
// }