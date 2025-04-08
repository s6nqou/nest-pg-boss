import { MetadataScanner, ModulesContainer } from "@nestjs/core";
import { Injectable as InjectableInterface } from "@nestjs/common/interfaces";
import { HandlerMetadata } from "./interfaces/handler-metadata.interface";
import PGBoss from "pg-boss";
export declare class HandlerScannerService {
    private readonly metadataScanner;
    readonly modulesContainer: ModulesContainer;
    private readonly logger;
    constructor(metadataScanner: MetadataScanner, modulesContainer: ModulesContainer);
    static exploreMethodMetadata(instancePrototype: InjectableInterface, methodKey: string): HandlerMetadata | null;
    getJobHandlers(): {
        metadata: HandlerMetadata;
        callback: PGBoss.WorkHandler<unknown>;
    }[];
}
