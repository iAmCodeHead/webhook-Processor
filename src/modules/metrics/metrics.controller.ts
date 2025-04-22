import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createRedisClient } from '@/utils/redis';
import { MetricsRepository } from './repository/metrics.repository';

export default class MetricsController {

  private readonly metrics: MetricsRepository;
  
  constructor() {
    this.metrics = new MetricsRepository(createRedisClient());
  }

  public getMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = {
            totalRequestsReceived: await this.metrics.getTotalRequestReceived(),
            totalRequestsProcessed: await this.metrics.getTotalProcessed(),
            currentQueueLength: await this.metrics.getCurrentQueueLength(),
            total429sReturned: await this.metrics.getTotal429s(),
            averageProcessingTime: await this.metrics.getAvgResponseTime(),
            totalFailedJobs: await this.metrics.getTotalFailedJobs(),
        }
        res.status(StatusCodes.OK).json({ message: 'Request Successful', data: {...data} });
    } catch (error) {
      next(error);
    }
  }
}
