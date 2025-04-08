import { Observable } from "rxjs";
export declare function getJobToken(jobName: string): string;
export declare function handleRetry(retryAttempts?: number, retryDelay?: number, verboseRetryLog?: boolean, toRetry?: (err: any) => boolean): <T>(source: Observable<T>) => Observable<T>;
