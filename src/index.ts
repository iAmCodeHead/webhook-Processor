import { setupServer } from '@/app';
import validateEnv from '@utils/validateEnv';
import ErrorMiddleware from '@middlewares/error.middleware';
import os from 'os';
import cluster from 'cluster';
import { PORT } from './config';
import { QueueProcessorService } from './modules/queue/queue-processor.service';
import http from "http";
import { Response } from "express";
import { logger } from './utils/pino-logger';
import { createRedisClient } from './utils/redis';

validateEnv();

const app = setupServer();
let server: http.Server;
const numCPUs = os.cpus().length;

const processor = new QueueProcessorService(createRedisClient());

async function bootstrap(): Promise<http.Server> {

  app.get("/", (_, res: Response) => {
    res.send(`Listening on port: ${PORT}`);
  });

  server = http.createServer(app);

  if (cluster.isPrimary) {
    logger.info(`Master ${process.pid} is running`);
  
    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork({ PORT: (Number(PORT!) + i).toString() });
      logger.info(`Forked worker PID: ${worker.process.pid}`);
    }
  
    cluster.on('exit', (worker, code, signal) => {
      logger.error(`Worker ${worker.process.pid} died | ${code} | ${signal}`);
      cluster.fork();
    });
  } else {
    server.listen(PORT, () => {
      processor.initiateQueueProcessor();
      processor.initiateRetriesProcessor();
    });
  }

  logger.info(`App started. Listening on port: ${PORT}`);
  return server;
}

async function handleShutdown () {
  logger.info(`[${process.pid}] Closing server...`);
  server.close(async () => {
    await processor.gracefulShutdown();
  });
};


bootstrap();

ErrorMiddleware.initializeUnhandledException();

process.on('SIGTERM', async () => {
  console.info('SIGTERM received');
  await handleShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.info('SIGINT received');
  await handleShutdown();
  process.exit(0);
});
