import { NODE_ENV } from "@/config";
import Redis, { Redis as RedisClient } from "ioredis";
import RedisMock from 'ioredis-mock';

export type RedisClientType = RedisClient | InstanceType<typeof RedisMock>; 
export function createRedisClient(): RedisClientType {
    
    if(NODE_ENV == 'test') return new RedisMock();

    return new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!),
        lazyConnect: true,
        enableOfflineQueue: NODE_ENV !== 'test',
    });
}
