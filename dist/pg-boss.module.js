"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectPgBoss = exports.PGBossModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const pg_boss_1 = require("pg-boss");
const rxjs_1 = require("rxjs");
const utils_1 = require("./utils");
const pg_boss_job_module_1 = require("./pg-boss-job.module");
const handler_scanner_service_1 = require("./handler-scanner.service");
const pg_boss_module_definition_1 = require("./pg-boss.module-definition");
const pg_boss_constants_1 = require("./pg-boss.constants");
let PGBossModule = class PGBossModule extends pg_boss_module_definition_1.ConfigurableModuleClass {
    moduleRef;
    handlerScannerService;
    logger = new common_1.Logger(this.constructor.name);
    instance;
    constructor(moduleRef, handlerScannerService) {
        super();
        this.moduleRef = moduleRef;
        this.handlerScannerService = handlerScannerService;
    }
    static forRoot(options) {
        const instanceProvider = {
            provide: pg_boss_constants_1.PG_BOSS_TOKEN,
            useFactory: async () => await this.createInstanceFactory(options),
        };
        const dynamicModule = super.forRoot(options);
        if (!dynamicModule.providers) {
            dynamicModule.providers = [];
        }
        dynamicModule.providers.push(instanceProvider);
        dynamicModule.exports ||= [];
        dynamicModule.exports.push(instanceProvider);
        return dynamicModule;
    }
    static forRootAsync(options) {
        const instanceProvider = {
            provide: pg_boss_constants_1.PG_BOSS_TOKEN,
            useFactory: async (pgBossModuleOptions) => {
                if (options.application_name) {
                    return await this.createInstanceFactory({
                        ...pgBossModuleOptions,
                        application_name: options.application_name,
                    });
                }
                return await this.createInstanceFactory(pgBossModuleOptions);
            },
            inject: [pg_boss_module_definition_1.MODULE_OPTIONS_TOKEN],
        };
        const dynamicModule = super.forRootAsync(options);
        if (!dynamicModule.providers) {
            dynamicModule.providers = [];
        }
        dynamicModule.providers.push(instanceProvider);
        if (!dynamicModule.exports) {
            dynamicModule.exports = [];
        }
        dynamicModule.exports.push(instanceProvider);
        return dynamicModule;
    }
    static async createInstanceFactory(options) {
        const pgBoss = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.defer)(async () => new pg_boss_1.default(options).start()).pipe((0, utils_1.handleRetry)(options.retryAttempts, options.retryDelay, options.verboseRetryLog, options.toRetry)));
        return pgBoss;
    }
    static forJobs(jobs) {
        return {
            module: pg_boss_job_module_1.PGBossJobModule,
            providers: jobs.map((job) => job.ServiceProvider),
            exports: jobs.map((job) => job.ServiceProvider.provide),
        };
    }
    onModuleInit() {
        this.instance = this.moduleRef.get(pg_boss_constants_1.PG_BOSS_TOKEN);
        this.instance.on('error', (error) => {
            this.logger.error(error);
        });
        this.instance.on('monitor-states', (states) => {
            this.logger.log({ states }, 'Monitor states');
        });
    }
    async onApplicationBootstrap() {
        await this.setupWorkers();
    }
    async onModuleDestroy() {
        try {
            if (this.instance) {
                await this.instance.stop();
            }
        }
        catch (e) {
            this.logger.error(e?.message);
        }
    }
    async setupWorkers() {
        if (!this.instance) {
            throw new Error("setupWorkers must be called after onApplicationBootstrap");
        }
        const jobHandlers = this.handlerScannerService.getJobHandlers();
        await Promise.all(jobHandlers.map(async (handler) => {
            const workerID = await this.instance.work(handler.metadata.jobName, handler.metadata.workOptions, handler.callback);
            this.logger.log({ workerID, jobName: handler.metadata.jobName }, "Registered Worker");
        }));
    }
};
exports.PGBossModule = PGBossModule;
exports.PGBossModule = PGBossModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [core_1.MetadataScanner, handler_scanner_service_1.HandlerScannerService],
    }),
    __metadata("design:paramtypes", [core_1.ModuleRef,
        handler_scanner_service_1.HandlerScannerService])
], PGBossModule);
const InjectPgBoss = () => (0, common_1.Inject)(pg_boss_constants_1.PG_BOSS_TOKEN);
exports.InjectPgBoss = InjectPgBoss;
//# sourceMappingURL=pg-boss.module.js.map