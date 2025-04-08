import type { ConstructorOptions } from "pg-boss";
export type PGBossModuleOptions = {
    retryAttempts?: number;
    retryDelay?: number;
    toRetry?: (err: any) => boolean;
    verboseRetryLog?: boolean;
} & ConstructorOptions;
