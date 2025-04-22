import { logger } from '@/utils/pino-logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class WebhookController {
  public processRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('new Job', req.body);
      res.status(StatusCodes.ACCEPTED).json({ message: 'Request accepted' });
    } catch (error) {
      next(error);
    }
  };
}
