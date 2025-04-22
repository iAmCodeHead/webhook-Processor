
import { logger } from '@/utils/pino-logger';
import { QueueRepository } from './repository/job-queue.repository';
import { MAX_PARALLEL_JOBS, SIMULATE_FAILURE, TRIGGER_QUEUES_IN_MS } from '@/config';
import { RedisClientType } from '@/utils/redis';
import { MetricsRepository } from '../metrics/repository/metrics.repository';
import { Job } from '@/interfaces/shared-job.interface';


export class QueueProcessorService {

private readonly repository: QueueRepository;
private readonly metricsRepository: MetricsRepository;

  constructor(redisClient: RedisClientType) {
    this.repository = new QueueRepository(redisClient);
    this.metricsRepository = new MetricsRepository(redisClient);
  }

  public async simulateProcessing(job: Job): Promise<unknown> {
    const delay = Math.floor(Math.random() * 200) + 100; // 100-300ms
    
    logger.info(`Starting job ${job.id} | Delay: ${delay}ms`);
  
    const res = await new Promise((r) => setTimeout(r, delay));

    // simulate failure
    if (SIMULATE_FAILURE && Math.random() < 0.1) {
      throw new Error('Random processing error');
    }
  
    logger.info(`Finished job ${job.id}`);
    return res;
  }
  
  public initiateQueueProcessor(runner: () => Promise<void> = this.runNextJob): void {
      setInterval(async () => {
        logger.info('initiating Queue Processing');
        await runner();
    }, Number(TRIGGER_QUEUES_IN_MS!));
  }

  private runNextJob = async (): Promise<void> => {
    const activeJobs = await this.metricsRepository.getActiveJobs();
    const pendingJobs = await this.metricsRepository.getPendingQueueLength();

    logger.info('runNextJob |', activeJobs);
    if (activeJobs >= Number(MAX_PARALLEL_JOBS)) return;
    if (pendingJobs === 0) return;

    const jobs: Job[] = [];

    while (jobs.length < Number(MAX_PARALLEL_JOBS) && pendingJobs > 0) {
      const job = await this.repository.dequeuePending();
      if (!job) return;
      jobs.push(job);
    }

    const jobPromises = jobs.map(async (job) => {
      logger.info({...job}, `processing job | ${job.id}`)
      const childlogger = logger.child({ JobId: job.id });
      try {
        await this.metricsRepository.incrementActiveJobs();
        await this.metricsRepository.measurePerf(() => this.simulateProcessing(job));
        await this.repository.enqueueSuccessful(job);
        childlogger.trace({ status: 'job successful', job });
      } catch (err) {
        await this.repository.enqueueFailed(job);
        childlogger.error({ job, status: 'job failed', err });
        logger.error(`Job ${job.id} failed: ${(err as Error).message}`);
      } finally {
        await this.metricsRepository.decrementActiveJobs();
      }
    });

    await Promise.all(jobPromises);

  }

  public initiateRetriesProcessor(runner: () => Promise<void> = this.runRetries): void {
    setInterval(async () => {
      logger.info('initiating retries');
      await runner();
  }, Number(TRIGGER_QUEUES_IN_MS!));
}

private runRetries = async(): Promise<void> => {
  const failedJobs = await this.metricsRepository.getFailedQueueLength();
  logger.info(failedJobs, ' | Failed jobs for retry');

  const jobs: Job[] = [];

  while (jobs.length < Number(MAX_PARALLEL_JOBS) && failedJobs > 0) {
    const job = await this.repository.dequeueFailed();
    if (!job) return;
    jobs.push(job);
  }

  const jobPromises = jobs.map(async (job) => {
    try {
      await this.metricsRepository.incrementActiveJobs();
      await this.metricsRepository.measurePerf(() => this.simulateProcessing(job));
      await this.repository.enqueueSuccessful(job);
    } catch (err) {
      await this.repository.populateDLQ(job);
      logger.error(`Job ${job.id} failed: ${(err as Error).message}`);
    } finally {
      await this.metricsRepository.decrementActiveJobs();
    }
  });

  await Promise.all(jobPromises);
}

public async gracefulShutdown(): Promise<void> {
  const activeJobs = await this.metricsRepository.getActiveJobs();
  logger.info(`[${process.pid}] Graceful shutdown started`);  
  return new Promise((resolve) => {
    if (activeJobs === 0) {
      logger.info('last job is complete: shutting down...');
      return resolve();
    }
   resolve();
  });
}

}
