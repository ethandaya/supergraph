import postgres, { PendingQuery } from "postgres";
import {
  AsyncStore,
  BaseStore,
  CrudData,
  CrudDto,
  ModelLookup,
  SchemaLookup,
} from "../store";
import { StoreType } from "../entity";
import { StatementLookup } from "./common";
import { z } from "zod";

type Statement = (dto: any) => PendingQuery<any>;

export class PostgresStore<
    H extends string,
    E extends ModelLookup<H>,
    A extends keyof E = keyof E
  >
  extends BaseStore<H, E, A>
  implements AsyncStore<H, E, A>
{
  type = StoreType.ASYNC;
  public sql: postgres.Sql;
  public stmts: StatementLookup<H, Statement>;

  constructor(public readonly models: SchemaLookup<H, E>) {
    super();
    this.sql = postgres(process.env.STORE_URL || "", {
      debug: false,
      types: {
        bigint: postgres.BigInt,
      },
      transform: postgres.camel,
    });
    this.stmts = this.prepareStatements(models);
  }

  prepareStatements(models: SchemaLookup<H, E>) {
    const stmts: StatementLookup<H, Statement> = {} as StatementLookup<
      H,
      Statement
    >;
    for (const [tableName, model] of Object.entries<z.AnyZodObject>(models)) {
      stmts[tableName as H] = {
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

  async get(entity: H, id: string | number): Promise<CrudData<E[A]["type"]>> {
    const stmts = this.stmts[entity];
    const [data] = await stmts.select({ id }).execute();
    return data;
  }
  async set(
    entity: H,
    id: string | number,
    data: CrudDto<E[A]["type"]>
  ): Promise<CrudData<E[A]["type"]>> {
    const stmts = this.stmts[entity];
    const model = this.models[entity];
    model.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);
    const dto = this.prepForSave({ id, ...data });
    await stmts.upsert(dto).execute();
    return dto;
  }
}