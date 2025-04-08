import { ClassConstructor } from "class-transformer";
import type { WorkOptions } from "pg-boss";
export interface HandlerMetadata {
    token: string;
    jobName: string;
    transformer?: ClassConstructor<any>;
    workOptions: WorkOptions;
}
