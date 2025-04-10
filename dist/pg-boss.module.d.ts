import { DynamicModule, OnApplicationBootstrap, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { HandlerScannerService } from "./handler-scanner.service";
import { Job } from "./job.service";
import { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, OPTIONS_TYPE } from "./pg-boss.module-definition";
export declare class PGBossModule extends ConfigurableModuleClass implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy {
    private readonly moduleRef;
    private readonly handlerScannerService;
    private readonly logger;
    private instance;
    constructor(moduleRef: ModuleRef, handlerScannerService: HandlerScannerService);
    static forRoot(options: typeof OPTIONS_TYPE): DynamicModule;
    static forRootAsync(options: ASYNC_OPTIONS_TYPE): DynamicModule;
    private static createInstanceFactory;
    static forJobs(jobs: Job[]): DynamicModule;
    onModuleInit(): void;
    onApplicationBootstrap(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private setupWorkers;
}
export declare const InjectPgBoss: () => PropertyDecorator & ParameterDecorator;
