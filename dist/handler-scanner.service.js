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
var HandlerScannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerScannerService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const pg_boss_constants_1 = require("./pg-boss.constants");
const class_transformer_1 = require("class-transformer");
let HandlerScannerService = HandlerScannerService_1 = class HandlerScannerService {
    metadataScanner;
    modulesContainer;
    logger = new common_1.Logger(this.constructor.name);
    constructor(metadataScanner, modulesContainer) {
        this.metadataScanner = metadataScanner;
        this.modulesContainer = modulesContainer;
    }
    static exploreMethodMetadata(instancePrototype, methodKey) {
        const targetCallback = instancePrototype[methodKey];
        const metadata = Reflect.getMetadata(pg_boss_constants_1.PG_BOSS_JOB_METADATA, targetCallback);
        if (metadata == null) {
            return null;
        }
        return metadata;
    }
    getJobHandlers() {
        const modules = [...this.modulesContainer.values()];
        const providersMap = modules
            .filter(({ providers }) => providers.size > 0)
            .map(({ providers }) => providers);
        const providerInstances = providersMap.flatMap((map) => [...map.values()]);
        return providerInstances
            .flatMap(({ instance }) => {
            const instancePrototype = Object.getPrototypeOf(instance || {});
            return this.metadataScanner
                .getAllMethodNames(instancePrototype)
                .map((methodName) => {
                const metadata = HandlerScannerService_1.exploreMethodMetadata(instancePrototype, methodName);
                if (metadata == null) {
                    return null;
                }
                const handler = instance[methodName].bind(instance);
                const callback = wrapHandler(handler, metadata.transformer);
                return {
                    metadata,
                    callback,
                };
            });
        })
            .filter(notEmpty);
    }
};
exports.HandlerScannerService = HandlerScannerService;
exports.HandlerScannerService = HandlerScannerService = HandlerScannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.MetadataScanner,
        core_1.ModulesContainer])
], HandlerScannerService);
function wrapHandler(handler, transformer) {
    if (transformer) {
        return (job) => {
            job.data = (0, class_transformer_1.plainToInstance)(transformer, job.data);
            return handler(job);
        };
    }
    return handler;
}
function notEmpty(value) {
    if (value === null || value === undefined) {
        return false;
    }
    const testDummy = value;
    return true;
}
//# sourceMappingURL=handler-scanner.service.js.map