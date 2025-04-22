import RedisMock from 'ioredis-mock';
import { FAILED_KEY, PENDING_KEY } from '../../../constants/queue.constant';
import { TRIGGER_QUEUES_IN_MS } from '@/config';
import { v4 as uuidv4 } from 'uuid';
import { QueueRepository } from '../repository/job-queue.repository';
import { QueueProcessorService } from '../queue-processor.service';
import { Job } from '@/interfaces/shared-job.interface';

/**
 * NOTE:This is a very basic test setup, a real-world
 * application should cover more test cases and more deeply 
 */
describe('Queue Processor', () => {

    const redis = new RedisMock();
    const repository = new QueueRepository(redis);
    const queueProcessor = new QueueProcessorService(redis);
  
  beforeAll(async () => {
    redis.flushall();
  });

  afterAll(async () => {
    redis.disconnect();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  jest.useFakeTimers();

  describe('initiateQueueProcessor()', () => {
    it(`it should process ${PENDING_KEY} after ${TRIGGER_QUEUES_IN_MS}ms`, async () => {

      const mockRunner = jest.fn();

      const job: Job = {
        id: uuidv4(),
        data: { event: 'process_payment', id: '1234' },
        attempts: 0,
      };
      await repository.enqueuePending(job);

      queueProcessor.initiateQueueProcessor(mockRunner);

      expect(mockRunner).not.toHaveBeenCalled();

      jest.advanceTimersByTime(Number(TRIGGER_QUEUES_IN_MS));

      await Promise.resolve();
      
      expect(mockRunner).toHaveBeenCalledTimes(1);
      expect(mockRunner).toHaveBeenCalled();
    });
  });

  describe('initiateRetriesProcessor()', () => {
    it(`it should process ${FAILED_KEY} after ${TRIGGER_QUEUES_IN_MS}ms`, async() => {
        const mockRunner = jest.fn();
  
        const job: Job = {
          id: uuidv4(),
          data: { event: 'process_payment', id: '1234' },
          attempts: 1,
        };
        await repository.enqueueFailed(job);
  
        queueProcessor.initiateRetriesProcessor(mockRunner);
  
        expect(mockRunner).not.toHaveBeenCalled();
  
        jest.advanceTimersByTime(Number(TRIGGER_QUEUES_IN_MS));
  
        await Promise.resolve();
        
        expect(mockRunner).toHaveBeenCalledTimes(1);
        expect(mockRunner).toHaveBeenCalled();
      });
    });
});