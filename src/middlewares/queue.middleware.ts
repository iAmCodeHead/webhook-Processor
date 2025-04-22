import { NextFunction, Request, RequestHandler, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/pino-logger';
import { StatusCodes } from 'http-status-codes';
import { QUEUE_RATE_LIMIT } from '@/config';
import { createRedisClient } from '@/utils/redis';
import { QueueRepository } from '@/modules/queue/repository/job-queue.repository';
import { Job } from '@/interfaces/shared-job.interface';
import { MetricsRepository } from '@/modules/metrics/repository/metrics.repository';

export default class QueueRateLimiter {

  static checkCapacity (): RequestHandler {
    const redis = createRedisClient();
    const metrics = new MetricsRepository(redis);
    const jobQueue = new QueueRepository(redis);
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const pendingQueue = await metrics.getPendingQueueLength();
        if (pendingQueue >= Number(QUEUE_RATE_LIMIT)) {
          await metrics.increment492s();
          res.status(StatusCodes.TOO_MANY_REQUESTS).json({ message: 'Too many requests. Try again later.' });
        }
  
        const job: Job = {
          id: uuidv4(),
          data: req.body,
          attempts: 0,
        };
        logger.info({...job}, 'new webhook request received!');
        await jobQueue.enqueuePending(job);
        await metrics.incrementRequestReceived();
        next(); 
      } catch (error) {
        next(error);
      }
    };
  };

}
