export type Job = {
    id: string;
    data: Record<string, unknown>;
    attempts: number;
};
