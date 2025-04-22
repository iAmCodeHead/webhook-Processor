import { logger } from '@/utils/pino-logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { WebhookService } from './webhook.service';

export default class WebhookController {

    private readonly webhookService: WebhookService;
    
    constructor() {
      this.webhookService = new WebhookService();
    }


  public processRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('new Job', req.body);

      const canQueueNewJob = await this.webhookService.checkQueueSpace();

      if(!canQueueNewJob) res.status(StatusCodes.TOO_MANY_REQUESTS).json({ message: 'Too many requests. Try again later.' });

      await this.webhookService.queueNewJob(req.body);

      res.status(StatusCodes.ACCEPTED).json({ message: 'Request accepted' });
    } catch (error) {
      next(error);
    }
  };
}
