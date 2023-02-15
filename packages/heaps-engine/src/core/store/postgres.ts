import { ModelLookup, StatementLookup, StoreMeta } from "./common";
import { CrudEntity, Store } from "../engine";
import postgres, { PendingQuery } from "postgres";
import { z } from "zod";

type Statement = (dto: any) => PendingQuery<any>;

export class PostgresStore<
  K extends string,
  T extends ModelLookup<K> = ModelLookup<K>
> implements Store
{
  public sql: postgres.Sql;
  public stmts: StatementLookup<K, Statement>;

  public meta: StoreMeta = {
    name: "postgres",
    description: "Postgres store",
    type: "async",
  };

  constructor(url: string, public readonly models: T) {
    this.sql = postgres(url, {
      debug: false,
      types: {
        bigint: postgres.BigInt,
      },
      transform: postgres.camel,
    });
    this.stmts = this.prepareStatements(models);
  }

  prepareStatements(models: T) {
    const stmts: StatementLookup<K, Statement> = {} as StatementLookup<
      K,
      Statement
    >;
    for (const [tableName, model] of Object.entries<z.AnyZodObject>(models)) {
      stmts[tableName as K] = {
        upsert: this.getUpsertStatementForModel(tableName, model),
        select: this.getSelectStatementForModel(tableName),
      };
    }
    return stmts;
  }

  getUpsertStatementForModel(tableName: string, model: z.AnyZodObject) {
    const inserts = Object.keys(model.shape);
    const updates = inserts.filter(
      (key) => key !== "id" && key !== "createdAt"
    );
    return (dto: any) => {
      console.log("Upserting: ", dto);
      return this.sql`INSERT INTO ${this.sql(tableName)} ${this.sql(
        dto,
        ...inserts
      )} ON CONFLICT (id) DO UPDATE SET ${this.sql(
        dto,
        ...updates
      )} WHERE ${this.sql(tableName)}.id = ${dto.id}`;
    };
  }

  getSelectStatementForModel(tableName: string) {
    return (dto: any) =>
      this.sql`select * from ${this.sql(tableName)} where id = ${
        dto.id
      } limit 1`;
  }

  async set<T extends Record<string, any>>(
    entity: K,
    id: string | number,
    data: T
  ): Promise<CrudEntity<T>> {
    const stmts = this.stmts[entity];
    const dto = {
      id,
      ...data,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };
    await stmts.upsert(dto).execute();
    return dto;
  }

  async get<J extends Record<string, any>>(
    entity: K,
    id: string | number
  ): Promise<CrudEntity<J>> {
    const [data] = await this.stmts[entity].select({ id }).execute();
    return data;
  }
}
