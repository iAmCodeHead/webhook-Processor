import cors, { CorsOptions } from 'cors';
import express, { Express } from 'express';
import helmet, { HelmetOptions } from 'helmet';
import ErrorMiddleware from '@middlewares/error.middleware';
import { NotFoundError } from '@exceptions/HttpException';
import rateLimiter from '@utils/rateLimiter';
import routes from './routes';
import cookieParser from 'cookie-parser';


export function setupServer(): Express {
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());

  app.use(helmet()) as HelmetOptions;

  app.use(cors()) as CorsOptions;

  app.use("/", rateLimiter);
  
  app.use("/", routes);

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => next(new NotFoundError(req.path)));
  app.use(ErrorMiddleware.handleError());

  return app;
}
