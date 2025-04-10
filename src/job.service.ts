import {
  FactoryProvider,
  Inject,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import PgBoss from "pg-boss";
import { HandlerMetadata } from "./interfaces/handler-metadata.interface";
import { PG_BOSS_JOB_METADATA, PG_BOSS_TOKEN } from "./pg-boss.constants";
import { getJobToken } from "./utils";
import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer";

@Injectable()
export class JobService<JobData extends object> {
  constructor(
    public readonly name: string,
    private readonly pgBoss: PgBoss,
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
    options: PgBoss.SendOptions,
  ): Promise<string | null> {
    return this.pgBoss.send(this.name, this.transformData(data), options);
  }

  async sendAfter(
    data: JobData,
    options: PgBoss.SendOptions,
    date: Date | string | number,
  ): Promise<string | null> {
    // sendAfter has three overloads for all date variants we accept
    return this.pgBoss.sendAfter(this.name, this.transformData(data), options, date as any);
  }

  async sendOnce(
    data: JobData,
    options: PgBoss.SendOptions,
    key: string,
  ): Promise<string | null> {
    return this.pgBoss.sendOnce(this.name, this.transformData(data), options, key);
  }

  async sendSingleton(
    data: JobData,
    options: PgBoss.SendOptions,
  ): Promise<string | null> {
    return this.pgBoss.sendSingleton(this.name, this.transformData(data), options);
  }

  async sendThrottled(
    data: JobData,
    options: PgBoss.SendOptions,
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
    options: PgBoss.SendOptions,
    seconds: number,
    key?: string,
  ): Promise<string | null> {
    if (key != undefined) {
      return this.pgBoss.sendDebounced(this.name, this.transformData(data), options, seconds, key);
    }
    return this.pgBoss.sendDebounced(this.name, this.transformData(data), options, seconds);
  }

  async insert(jobs: Omit<PgBoss.JobInsert<JobData>, "name">[]) {
    const _jobs: PgBoss.JobInsert<object>[] = jobs.map((job) => ({
      ...job,
      name: this.name,
      data: job.data && this.transformData(job.data),
    }));
    return this.pgBoss.insert(_jobs);
  }

  async schedule(cron: string, data: JobData, options: PgBoss.ScheduleOptions) {
    return this.pgBoss.schedule(this.name, cron, this.transformData(data), options);
  }

  async unschedule() {
    return this.pgBoss.unschedule(this.name);
  }
}

interface MethodDecorator<PropertyType> {
  <Class>(
    target: Class,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<PropertyType>,
  ): TypedPropertyDescriptor<PropertyType>;
}

interface HandleDecorator<JobData extends object> {
  <Options extends PgBoss.WorkOptions>(
    options?: Options,
  ): MethodDecorator<
    Options extends { batchSize: number }
    ? PgBoss.BatchWorkHandler<JobData>
    : PgBoss.WorkHandler<JobData>
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
      useFactory: (pgBoss: PgBoss) => new JobService<JobData>(name, pgBoss, transformer),
      inject: [PG_BOSS_TOKEN],
    },
    Inject: () => Inject(token),
    Handle: (options: PgBoss.WorkOptions = {}) =>
      SetMetadata<string, HandlerMetadata>(PG_BOSS_JOB_METADATA, {
        token,
        jobName: name,
        workOptions: options,
        transformer,
      }),
  };
}
