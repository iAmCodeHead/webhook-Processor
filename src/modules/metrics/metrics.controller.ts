import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MetricsService } from './metrics.service';

export default class MetricsController {

  private readonly metrics: MetricsService;
  
  constructor() {
    this.metrics = new MetricsService();
  }

  public getMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {

     const [totalRequestsReceived,
      totalRequestsProcessed,
      currentQueueLength,
      total429sReturned,
      averageProcessingTime,
      totalFailedJobs] = await Promise.all([
        this.metrics.getTotalRequestReceived(),
        this.metrics.getTotalProcessed(),
        this.metrics.getCurrentQueueLength(),
        this.metrics.getTotal429s(),
        this.metrics.getAvgResponseTime(),
        this.metrics.getTotalFailedJobs(),
      ]);
      
        const data = {
            totalRequestsReceived,
            totalRequestsProcessed,
            currentQueueLength,
            total429sReturned,
            averageProcessingTime,
            totalFailedJobs,
        }
        res.status(StatusCodes.OK).json({ message: 'Request Successful', data });
    } catch (error) {
      next(error);
    }
  }
}
