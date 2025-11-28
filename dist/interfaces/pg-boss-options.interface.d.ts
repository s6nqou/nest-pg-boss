import type { ConstructorOptions } from "pg-boss";
export type PGBossModuleOptions = {
    enabled?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
    toRetry?: (err: any) => boolean;
    verboseRetryLog?: boolean;
} & ConstructorOptions;
