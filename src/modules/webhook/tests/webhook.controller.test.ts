import { setupServer } from "@/app";
import {
	StatusCodes,
} from 'http-status-codes';
import request from 'supertest';
import { Express } from "express";
import http, { Server } from "http";
import { PORT, QUEUE_RATE_LIMIT } from "@/config";
import RedisMock from 'ioredis-mock';
import { MetricsRepository } from "@/modules/metrics/repository/metrics.repository";

jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));

describe('Webhook Controller', () => {
    let app: Express;
    let server: Server;

    const redis = new RedisMock();
    const metrics = new MetricsRepository(redis);

  beforeAll(async () => {
    app = setupServer();
    server = http.createServer(app).listen(PORT);
    redis.flushall();
  });

  afterAll(async () => {
    redis.disconnect();
    server.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

    const newWebhookReq = () => {
        return { id: "1", data: "one" };
    };

  describe('[POST] /webhook', () => {
    it(`should return ${StatusCodes.ACCEPTED} for arbitrary JSON`, async () => {
        const response = await request(server).post('/webhook').send(newWebhookReq()).set('Content-Type', 'application/json');
        expect(response.status).toBe(StatusCodes.ACCEPTED);
        expect(response.body.message).toBe("Request accepted");
    });

    it(`should return ${StatusCodes.UNPROCESSABLE_ENTITY}`, async () => {
        const response = await request(server).post('/webhook').send({}).set('Content-Type', 'application/json');
        expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(response.body).toMatchObject({
            message: "Request validation failed",
            rawErrors: expect.arrayContaining([
              "JSON can not be empty"
            ])
        });
    });

    it(`should return ${StatusCodes.TOO_MANY_REQUESTS} when request hits a set threshold of ${QUEUE_RATE_LIMIT}`, async () => {
        const spy = jest.spyOn(MetricsRepository.prototype, 'getPendingQueueLength').mockResolvedValue(Number(QUEUE_RATE_LIMIT!));
        const response = await request(server).post('/webhook').send(newWebhookReq()).set('Content-Type', 'application/json');
        expect(response.status).toBe(StatusCodes.TOO_MANY_REQUESTS);
    });

    it(`should allow the request if pending jobs < ${QUEUE_RATE_LIMIT}`, async () => {
    
        jest.spyOn(MetricsRepository.prototype, 'getPendingQueueLength').mockResolvedValue(Number(QUEUE_RATE_LIMIT!) - 1);

        const response = await request(server)
          .post('/webhook')
          .send(newWebhookReq());
    
        expect(response.status).toBe(StatusCodes.ACCEPTED);
        expect(response.body.message).toBe("Request accepted");
      });

  });

});