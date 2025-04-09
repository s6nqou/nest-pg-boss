import { FactoryProvider } from "@nestjs/common";
import * as PGBoss from "pg-boss";
import { ClassConstructor } from "class-transformer";
export declare class JobService<JobData extends object> {
    readonly name: string;
    readonly pgBoss: PGBoss;
    private readonly transformer?;
    constructor(name: string, pgBoss: PGBoss, transformer?: ClassConstructor<JobData> | undefined);
    private transformData;
    send(data: JobData, options: PGBoss.SendOptions): Promise<string | null>;
    sendAfter(data: JobData, options: PGBoss.SendOptions, date: Date | string | number): Promise<string | null>;
    sendOnce(data: JobData, options: PGBoss.SendOptions, key: string): Promise<string | null>;
    sendSingleton(data: JobData, options: PGBoss.SendOptions): Promise<string | null>;
    sendThrottled(data: JobData, options: PGBoss.SendOptions, seconds: number, key?: string): Promise<string | null>;
    sendDebounced(data: JobData, options: PGBoss.SendOptions, seconds: number, key?: string): Promise<string | null>;
    insert(jobs: Omit<PGBoss.JobInsert<JobData>, "name">[]): Promise<void>;
    schedule(cron: string, data: JobData, options: PGBoss.ScheduleOptions): Promise<void>;
    unschedule(): Promise<void>;
}
interface MethodDecorator<PropertyType> {
    <Class>(target: Class, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<PropertyType>): TypedPropertyDescriptor<PropertyType>;
}
interface HandleDecorator<JobData extends object> {
    <Options extends PGBoss.WorkOptions>(options?: Options): MethodDecorator<Options extends {
        batchSize: number;
    } ? PGBoss.BatchWorkHandler<JobData> : PGBoss.WorkHandler<JobData>>;
}
export interface Job<JobData extends object = any> {
    ServiceProvider: FactoryProvider<JobService<JobData>>;
    Inject: () => ParameterDecorator;
    Handle: HandleDecorator<JobData>;
}
export declare function createJob<JobData extends object>(name: string, transformer?: ClassConstructor<JobData>): Job<JobData>;
export {};
