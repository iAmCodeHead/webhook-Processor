import RequestValidator from '@/middlewares/validation.middleware';
import { Router } from 'express';
import { WebhookDto } from '../modules/webhook/dtos/webhook.dto';
import WebhookController from '../modules/webhook/webhook.controller';
import QueueRateLimiter from '@/middlewares/queue.middleware';

  const router = Router();
  const webhookController = new WebhookController();

  router.post('/', [RequestValidator.validateArbitraryBody(), QueueRateLimiter.checkCapacity()], webhookController.processRequest);

export default router;