import RedisMock from 'ioredis-mock';
import { FAILED_KEY, PENDING_KEY } from '../../../constants/queue.constant';
import { v4 as uuidv4 } from 'uuid';
import { QueueRepository } from '../repository/job-queue.repository';
import { MetricsRepository } from '@/modules/metrics/repository/metrics.repository';
import { Job } from '@/interfaces/shared-job.interface';

jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));

describe('Job Queue', () => {

    const redis = new RedisMock();
    const metrics = new MetricsRepository(redis);
    const repository = new QueueRepository(redis);

    const generateJob = (attepmt: number): Job => {
      return {
        id: uuidv4(),
        data: { event: 'process_payment', id: '1234' },
        attempts: attepmt,
      }
    };

    

    beforeEach(async () => {
      redis.flushall();
    });
    
  beforeAll(async () => {
    redis.flushall();
  });

  afterAll(async () => {
    redis.disconnect();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('enqueuePending()', () => {
    it('it should queue request', async() => {
      const job = generateJob(0);
      await repository.enqueuePending(job);
      expect(await metrics.getPendingQueueLength()).toBe(1);
    });

    it('it should increment requestReceived', async () => {
      const job = generateJob(0);
      await repository.enqueuePending(job);
      expect(await metrics.getTotalRequestReceived()).toBe(1);
    });

  });

  describe('dequeuePending()', () => {
    it(`it should return dequeued item from ${PENDING_KEY}`, async () => {

      const job = generateJob(0);

      await repository.enqueuePending(job);

      const dequeuedJob = await repository.dequeuePending();
      expect(dequeuedJob).toMatchObject(job);
    });

    it(`it should return null if ${PENDING_KEY} is empty`, async () => {
      const dequeuedJob = await repository.dequeuePending();
      expect(dequeuedJob).toBe(null);
    });

  });

  describe('enqueueSuccessful()', () => {
    it('it should queue processed request', async () => {
      const job = generateJob(0);
      await repository.enqueueSuccessful(job);
      expect(await metrics.getProccessedQueueLength()).toBe(1);
    });

    it('Queued request should have attempt of 1', async () => {
      const job = generateJob(0);
      const proccessedJob = await repository.enqueueSuccessful(job);
      expect(proccessedJob).toMatchObject({
        id: job.id,
        data: job.data,
        attempts: 1
      });
    });
  });

  describe('enqueueFailed()', () => {
    it('it should queue failed request', async () => {
      const job = generateJob(0);
      await repository.enqueueFailed(job);
      expect(await metrics.getFailedQueueLength()).toBe(1);
    });

    it('Queued request should have attempt of 1', async () => {
      const job = generateJob(0);
      const proccessedJob = await repository.enqueueFailed(job);
      expect(proccessedJob).toMatchObject({
        id: job.id,
        data: job.data,
        attempts: 1
      });
    });
  });

  describe('dequeueFailed()', () => {

    it(`it should remove and return queued request from ${FAILED_KEY}`, async () => {
      const job = generateJob(0);
      await repository.enqueueFailed(job);

      const dequeuedJob = await repository.dequeueFailed();
      expect(dequeuedJob).toMatchObject({
        id: job.id,
        data: job.data,
        attempts: 1
      });
    });

    it(`it should return null if ${FAILED_KEY} is empty`, async () => {
      const dequeuedJob = await repository.dequeueFailed();
      expect(dequeuedJob).toBe(null);
    });

  });

  describe('populateDLQ()', () => {
    it('it should queue Dead requests', async () => {
    const job = generateJob(1);
      await repository.populateDLQ(job);
      expect(await repository.getDlqQueueLength()).toBe(1);
    });

    it('Queued request should have attempt of 2', async () => {
    const job = generateJob(1);
      const deadJob = await repository.populateDLQ(job);
      expect(deadJob).toMatchObject({
        id: job.id,
        data: job.data,
        attempts: 2
      });
    });

  });

});