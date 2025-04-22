import { QUEUE_NAME } from "@/config";

export const PENDING_KEY = `${QUEUE_NAME}:pending`;
export const PROCESSED_KEY = `${QUEUE_NAME}:processed`;
export const FAILED_KEY = `${QUEUE_NAME}:failed`;
export const DLQ_KEY = `${QUEUE_NAME}:dlq`;

export const TOTAL_REQUESTS_RECEIVED = `${QUEUE_NAME}:metrics:total_requests`;
export const TOTAL_429s = `${QUEUE_NAME}:metrics:overload_count`;
export const TOTAL_FAILED_JOBS = `${QUEUE_NAME}:metrics:failed:jobs`;
export const TOTAL_PROCESSED_JOBS = `${QUEUE_NAME}:metrics:processed_jobs`;
export const ACTIVE_JOBS = `${QUEUE_NAME}:metrics:active_jobs`;
export const PROCESSING_TIME = `${QUEUE_NAME}:metrics:total_processing_time`;
