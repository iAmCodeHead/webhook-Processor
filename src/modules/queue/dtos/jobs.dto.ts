import { Job } from "@/interfaces/shared-job.interface";

export interface Queue {
    processed: Job[];
    pending: Job[];
    failed: Job[];
    dlq: Job[];
}

export enum JobStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export interface WorkerBatchResponse {
    success: boolean;
    results: {
      id: number;
      success: boolean;
      message: string;
    }[];
}