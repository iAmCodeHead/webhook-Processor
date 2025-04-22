import { ProcessedResult } from "@/interfaces/shared-job.interface";
import { ACTIVE_JOBS, FAILED_KEY, PENDING_KEY, PROCESSED_KEY, PROCESSING_TIME, TOTAL_429s, TOTAL_FAILED_JOBS, TOTAL_PROCESSED_JOBS, TOTAL_REQUESTS_RECEIVED } from "@/constants/queue.constant";
import { RedisClientType } from "@/utils/redis";

export class MetricsRepository {

  private readonly redis: RedisClientType;
  
    constructor(redisClient: RedisClientType) {
      this.redis = redisClient;
    }

    public async increment492s() {
      await this.redis.incr(TOTAL_429s);
    }
    
    public async incrementRequestReceived() {
      await this.redis.incr(TOTAL_REQUESTS_RECEIVED);
    }
    
    public async incrementFailedProcesses() {
      await this.redis.incr(TOTAL_FAILED_JOBS);
    }
    
    public async incrementProcessedJob() {
      await this.redis.incr(TOTAL_PROCESSED_JOBS);
    }
    
    public async incrementActiveJobs() {
      await this.redis.incr(ACTIVE_JOBS);
    }
    
    public async decrementActiveJobs() {
      await this.redis.decr(ACTIVE_JOBS);
    }
    
    public async getActiveJobs() {
      return Number(await this.redis.get(ACTIVE_JOBS)) || 0;
    }

    public async getPendingQueueLength(): Promise<number> {
      return await this.redis.llen(PENDING_KEY);
    }
    
    public async getProccessedQueueLength(): Promise<number> {
      return await this.redis.llen(PROCESSED_KEY);
    }
    
    public async getFailedQueueLength(): Promise<number> {
      return await this.redis.llen(FAILED_KEY);
    }

    public getTotalProcessed(): Promise<number> {
      return this.getProccessedQueueLength();
    }
    
    public getTotalFailedJobs(): Promise<number> {
      return this.getFailedQueueLength();
    }
    
    public getCurrentQueueLength(): Promise<number> {
      return this.getPendingQueueLength();
    }

    public async getTotal429s(): Promise<number> {
      return Number(await this.redis.get(TOTAL_429s)) || 0;
    }
    
    public async getTotalRequestReceived(): Promise<number> {
      return Number(await this.redis.get(TOTAL_REQUESTS_RECEIVED)) || 0;
    }
    
    public async getAvgResponseTime(): Promise<number> {
      const totalProcessingTime = Number(await this.redis.get(PROCESSING_TIME));
      const totalProcessedRequests = await this.getProccessedQueueLength();
      if(totalProcessingTime && totalProcessedRequests) {
        return Number((totalProcessingTime / totalProcessedRequests).toFixed(2));
      }
      return 0;
    }
    
    private async incrementTotalProcessingTime(time: number): Promise<void> {
      await this.redis.incrbyfloat(PROCESSING_TIME, time);
    }
    
    public async measurePerf(fn: Function): Promise<ProcessedResult> {
      const start = performance.now();
      const result = await fn();
      const duration = performance.now() - start;
      await this.incrementTotalProcessingTime(duration);
      return result;
    }
    
}