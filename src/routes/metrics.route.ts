import MetricsController from '@/modules/metrics/metrics.controller';
import { Router } from 'express';

  const router = Router();
  const metricsController = new MetricsController();

  router.get('/', metricsController.getMetrics)

export default router;