import RequestValidator from '@/middlewares/validation.middleware';
import { Router } from 'express';
import WebhookController from '../modules/webhook/webhook.controller';

  const router = Router();
  const webhookController = new WebhookController();

  router.post('/', RequestValidator.validateArbitraryBody(), webhookController.processRequest);

export default router;