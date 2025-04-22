import { createRedisClient } from "@/utils/redis";
import { MetricsRepository } from "./repository/metrics.repository";

export class MetricsService {

    private readonly repository: MetricsRepository;
    private readonly redis = createRedisClient();
    
    constructor() {
        this.repository = new MetricsRepository(this.redis);
    }

    public getTotalProcessed(): Promise<number> {
        return this.repository.getProccessedQueueLength();
    }
    
    public getTotalFailedJobs(): Promise<number> {
        return this.repository.getFailedQueueLength();
    }
    
    public getCurrentQueueLength(): Promise<number> {
        return this.repository.getPendingQueueLength();
    }

    public async getTotalRequestReceived(): Promise<number> {
        return this.repository.getTotalRequestReceived();
    }

    public async getTotal429s(): Promise<number> {
        return this.repository.getTotal429s();
    }

    public async getAvgResponseTime(): Promise<number> {
        return this.repository.getAvgResponseTime();
    }

}