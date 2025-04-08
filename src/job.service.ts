import {
  FactoryProvider,
  Inject,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import * as PGBoss from "pg-boss";
import { HandlerMetadata } from "./interfaces/handler-metadata.interface";
import { PG_BOSS_JOB_METADATA } from "./pg-boss.constants";
import { getJobToken } from "./utils";
import { ClassConstructor, instanceToPlain, plainToClass, plainToInstance } from "class-transformer";

@Injectable()
export class JobService<JobData extends object> {
  constructor(
    public readonly name: string,
    public readonly pgBoss: PGBoss,
    private readonly transformer?: ClassConstructor<JobData>,
  ) { }

  private transformData(data: JobData): object {
    if (this.transformer) {
      if (data instanceof this.transformer) {
        return instanceToPlain(data);
      } else {
        return instanceToPlain(plainToInstance(this.transformer, data));
      }
    }
    return data;
  }

  async send(
    data: JobData,
    options: PGBoss.SendOptions,
  ): Promise<string | null> {
    return this.pgBoss.send(this.name, this.transformData(data), options);
  }

  async sendAfter(
    data: JobData,
    options: PGBoss.SendOptions,
    date: Date | string | number,
  ): Promise<string | null> {
    // sendAfter has three overloads for all date variants we accept
    return this.pgBoss.sendAfter(this.name, this.transformData(data), options, date as any);
  }

  async sendOnce(
    data: JobData,
    options: PGBoss.SendOptions,
    key: string,
  ): Promise<string | null> {
    return this.pgBoss.sendOnce(this.name, this.transformData(data), options, key);
  }

  async sendSingleton(
    data: JobData,
    options: PGBoss.SendOptions,
  ): Promise<string | null> {
    return this.pgBoss.sendSingleton(this.name, this.transformData(data), options);
  }

  async sendThrottled(
    data: JobData,
    options: PGBoss.SendOptions,
    seconds: number,
    key?: string,
  ): Promise<string | null> {
    if (key != undefined) {
      return this.pgBoss.sendThrottled(this.name, this.transformData(data), options, seconds, key);
    }
    return this.pgBoss.sendThrottled(this.name, this.transformData(data), options, seconds);
  }

  async sendDebounced(
    data: JobData,
    options: PGBoss.SendOptions,
    seconds: number,
    key?: string,
  ): Promise<string | null> {
    if (key != undefined) {
      return this.pgBoss.sendDebounced(this.name, this.transformData(data), options, seconds, key);
    }
    return this.pgBoss.sendDebounced(this.name, this.transformData(data), options, seconds);
  }

  async insert(jobs: Omit<PGBoss.JobInsert<JobData>, "name">[]): Promise<string[] | null> {
    const _jobs: PGBoss.JobInsert<object>[] = jobs.map((job) => ({
      ...job,
      name: this.name,
      data: job.data && this.transformData(job.data),
    }));
    const result: any = await this.pgBoss.insert(_jobs);
    if (result && result.rowCount > 0) {
      return result.rows.map((row: any) => row.id);
    }
    return null;
  }

  async schedule(cron: string, data: JobData, options: PGBoss.ScheduleOptions) {
    return this.pgBoss.schedule(this.name, cron, this.transformData(data), options);
  }

  async unschedule() {
    return this.pgBoss.unschedule(this.name);
  }
}

export interface WorkHandler<ReqData> {
  (job?: PGBoss.Job<ReqData>): Promise<void>;
}

export interface WorkHandlerBatch<ReqData> {
  (jobs?: PGBoss.Job<ReqData>[]): Promise<void>;
}

interface MethodDecorator<PropertyType> {
  <Class>(
    target: Class,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<PropertyType>,
  ): TypedPropertyDescriptor<PropertyType>;
}

interface HandleDecorator<JobData extends object> {
  <Options extends PGBoss.WorkOptions>(
    options?: Options,
  ): MethodDecorator<
    Options extends { batchSize: number }
    ? WorkHandlerBatch<JobData>
    : WorkHandler<JobData>
  >;
}

export interface Job<JobData extends object = any> {
  ServiceProvider: FactoryProvider<JobService<JobData>>;
  Inject: () => ParameterDecorator;
  Handle: HandleDecorator<JobData>;
}

export function createJob<JobData extends object>(
  name: string,
  transformer?: ClassConstructor<JobData>,
): Job<JobData> {
  const token = getJobToken(name);

  return {
    ServiceProvider: {
      provide: token,
      useFactory: (pgBoss: PGBoss) => new JobService<JobData>(name, pgBoss, transformer),
      inject: [PGBoss],
    },
    Inject: () => Inject(token),
    Handle: (options: PGBoss.WorkOptions = {}) =>
      SetMetadata<string, HandlerMetadata>(PG_BOSS_JOB_METADATA, {
        token,
        jobName: name,
        workOptions: options,
        transformer,
      }),
  };
}
