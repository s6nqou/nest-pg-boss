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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = exports.JobService = void 0;
const common_1 = require("@nestjs/common");
const pg_boss_1 = __importDefault(require("pg-boss"));
const pg_boss_constants_1 = require("./pg-boss.constants");
const utils_1 = require("./utils");
const class_transformer_1 = require("class-transformer");
let JobService = class JobService {
    name;
    pgBoss;
    transformer;
    constructor(name, pgBoss, transformer) {
        this.name = name;
        this.pgBoss = pgBoss;
        this.transformer = transformer;
    }
    transformData(data) {
        if (this.transformer) {
            if (data instanceof this.transformer) {
                return (0, class_transformer_1.instanceToPlain)(data);
            }
            else {
                return (0, class_transformer_1.instanceToPlain)((0, class_transformer_1.plainToInstance)(this.transformer, data));
            }
        }
        return data;
    }
    async send(data, options) {
        return this.pgBoss.send(this.name, this.transformData(data), options);
    }
    async sendAfter(data, options, date) {
        return this.pgBoss.sendAfter(this.name, this.transformData(data), options, date);
    }
    async sendOnce(data, options, key) {
        return this.pgBoss.sendOnce(this.name, this.transformData(data), options, key);
    }
    async sendSingleton(data, options) {
        return this.pgBoss.sendSingleton(this.name, this.transformData(data), options);
    }
    async sendThrottled(data, options, seconds, key) {
        if (key != undefined) {
            return this.pgBoss.sendThrottled(this.name, this.transformData(data), options, seconds, key);
        }
        return this.pgBoss.sendThrottled(this.name, this.transformData(data), options, seconds);
    }
    async sendDebounced(data, options, seconds, key) {
        if (key != undefined) {
            return this.pgBoss.sendDebounced(this.name, this.transformData(data), options, seconds, key);
        }
        return this.pgBoss.sendDebounced(this.name, this.transformData(data), options, seconds);
    }
    async insert(jobs) {
        const _jobs = jobs.map((job) => ({
            ...job,
            name: this.name,
            data: job.data && this.transformData(job.data),
        }));
        return this.pgBoss.insert(_jobs);
    }
    async schedule(cron, data, options) {
        return this.pgBoss.schedule(this.name, cron, this.transformData(data), options);
    }
    async unschedule() {
        return this.pgBoss.unschedule(this.name);
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, pg_boss_1.default, Object])
], JobService);
function createJob(name, transformer) {
    const token = (0, utils_1.getJobToken)(name);
    return {
        ServiceProvider: {
            provide: token,
            useFactory: (pgBoss) => new JobService(name, pgBoss, transformer),
            inject: [pg_boss_constants_1.PG_BOSS_TOKEN],
        },
        Inject: () => (0, common_1.Inject)(token),
        Handle: (options = {}) => (0, common_1.SetMetadata)(pg_boss_constants_1.PG_BOSS_JOB_METADATA, {
            token,
            jobName: name,
            workOptions: options,
            transformer,
        }),
    };
}
exports.createJob = createJob;
//# sourceMappingURL=job.service.js.map