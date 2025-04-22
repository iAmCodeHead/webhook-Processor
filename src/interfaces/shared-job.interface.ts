export type ProcessedResult = {
    success: boolean, 
    job: Job
};

export type Job = {
    id: string;
    data: Record<string, unknown>;
    attempts: number;
};
