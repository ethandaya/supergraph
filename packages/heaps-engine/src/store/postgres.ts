import postgres, { PendingQuery } from "postgres";
import {
  AsyncStore,
  BaseStore,
  CrudData,
  CrudDto,
  ModelLookup,
} from "../store";
import { StoreType } from "../entity";
import { z } from "zod";
import { ModelSchemaLookup, StatementLookup } from "./common";

type Statement = (dto: any, sql?: postgres.Sql) => PendingQuery<any>;

export class PostgresStore<
    H extends string,
    E extends ModelLookup<H> = ModelLookup<H>,
    A extends keyof E = keyof E,
    P extends StatementLookup<H, E, Statement> = StatementLookup<
      H,
      E,
      Statement
    >
  >
  extends BaseStore<E, A>
  implements AsyncStore<E, A>
{
  type = StoreType.ASYNC;
  public sql: postgres.Sql;
  public stmts: P;
  constructor(public readonly models: ModelSchemaLookup<H, E>) {
    super();
    this.sql = postgres(process.env.STORE_URL || "", {
      // debug: (_, s) => console.log(s),
      types: {
        bigint: postgres.BigInt,
      },
      transform: postgres.camel,
    });
    this.stmts = this.prepareStatements(models);
  }

  prepareStatements(models: ModelSchemaLookup<H, E>) {
    const keys: H[] = Object.keys(models) as H[];
    return keys.reduce<P>(
      (acc, key) => ({
        ...acc,
        [key]: {
          upsert: this.getUpsertStatementForModel(key, models[key]),
          select: this.getSelectStatementForModel(key),
        },
      }),
      {} as P
    );
  }

  getUpsertStatementForModel(tableName: string, model: z.AnyZodObject) {
    const inserts = Object.keys(model.shape);
    const updates = inserts.filter(
      (key) => key !== "id" && key !== "createdAt"
    );
    return (dto: any, sql: postgres.Sql = this.sql) => {
      return sql`INSERT INTO ${sql(tableName)} ${sql(
        dto,
        ...inserts
      )} ON CONFLICT (id) DO UPDATE SET ${sql(dto, ...updates)} WHERE ${sql(
        tableName
      )}.id = ${dto.id}`;
    };
  }

  getSelectStatementForModel(tableName: string) {
    return (dto: any, sql: postgres.Sql = this.sql) =>
      sql`select * from ${sql(tableName)} where id = ${dto.id} limit 1`;
  }

  async get<J extends A = A>(
    entity: J,
    id: string | number
  ): Promise<CrudData<E[J]["type"]>> {
    const stmts = this.stmts[entity];
    const [data] = await stmts.select({ id }).execute();
    return data;
  }
  async set<J extends A = A>(
    entity: J,
    id: string | number,
    data: CrudDto<E[J]["type"]>
  ): Promise<CrudData<E[J]["type"]>> {
    const stmts = this.stmts[entity];
    const model = this.models[entity];
    model.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);
    const dto = this.prepForSave({ id, ...data });
    await stmts.upsert(dto).execute();
    // TODO - add mature logic to discern data updates in mem
    return this.get(entity, id);
  }

  async startBatch() {
    throw new Error("Method not implemented.");
  }

  async commitBatch() {
    throw new Error("Method not implemented.");
  }

  async close() {
    throw new Error("Method not implemented.");
  }
}
