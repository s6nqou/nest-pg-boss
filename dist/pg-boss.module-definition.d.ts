import { PGBossModuleOptions } from "./interfaces";
declare const ConfigurableModuleClass: import("@nestjs/common").ConfigurableModuleCls<PGBossModuleOptions, "forRoot", "create", {}>, MODULE_OPTIONS_TOKEN: string | symbol, OPTIONS_TYPE: {
    enabled?: boolean | undefined;
    retryAttempts?: number | undefined;
    retryDelay?: number | undefined;
    toRetry?: ((err: any) => boolean) | undefined;
    verboseRetryLog?: boolean | undefined;
} & import("pg-boss").DatabaseOptions & import("pg-boss").QueueOptions & import("pg-boss").SchedulingOptions & import("pg-boss").MaintenanceOptions & import("pg-boss").ExpirationOptions & import("pg-boss").RetentionOptions & import("pg-boss").RetryOptions & import("pg-boss").JobPollingOptions & import("pg-boss").CompletionOptions & Partial<{}>, ASYNC_OPTIONS_TYPE: import("@nestjs/common").ConfigurableModuleAsyncOptions<PGBossModuleOptions, "create"> & Partial<{}>;
type ASYNC_OPTIONS_TYPE_WITH_NAME = typeof ASYNC_OPTIONS_TYPE & {
    application_name: string;
};
export { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE_WITH_NAME as ASYNC_OPTIONS_TYPE, };
