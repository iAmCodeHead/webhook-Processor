import { Job } from "@/interfaces/shared-job.interface";
import { logger } from "@/utils/pino-logger";
import { QueueRepository } from "../queue/repository/job-queue.repository";
import { createRedisClient } from "@/utils/redis";
import { v4 as uuidv4 } from 'uuid';
import { MetricsRepository } from "../metrics/repository/metrics.repository";
import { QUEUE_RATE_LIMIT } from "@/config";

export class WebhookService {
    private readonly metricRepository: MetricsRepository;
    private readonly queueRepository: QueueRepository;
    private redis = createRedisClient();
    
    constructor() {
        this.metricRepository = new MetricsRepository(this.redis);
        this.queueRepository = new QueueRepository(this.redis);
    }

    public async checkQueueSpace(): Promise<boolean> {
      const pendingQueue = await this.metricRepository.getPendingQueueLength();
      if (pendingQueue >= Number(QUEUE_RATE_LIMIT)) {
        await this.metricRepository.increment492s();
        return false;
      }
      return true;
    }
    
    public async queueNewJob(payload: Record<string, unknown>): Promise<void> {
        const job: Job = {
            id: uuidv4(),
            data: payload,
            attempts: 0,
        };

        logger.info(job, 'new webhook request received!');
        await this.queueRepository.enqueuePending(job);
        await this.metricRepository.incrementRequestReceived();
    }

}