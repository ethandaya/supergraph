import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { baseSchema, StoreType } from "../../src/core/entity";
import { z } from "zod";
import {
  AsyncStore,
  BaseStore,
  CrudData,
  CrudDto,
  ModelLookup,
  SchemaLookup,
} from "../../src/core/store";
import postgres, { PendingQuery } from "postgres";
import { StatementLookup } from "../../src";

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

const testSchema = baseSchema.extend({
  name: z.string(),
});

describe("Postgres Store", () => {
  let postgresStore: PostgresStore<
    "test",
    { test: { type: z.infer<typeof testSchema>; schema: typeof testSchema } }
  >;

  beforeAll(async () => {
    vi.stubEnv(
      "STORE_URL",
      "postgres://postgres:postgres@localhost:5432/postgres"
    );
    postgresStore = new PostgresStore({
      test: testSchema,
    });
    await postgresStore.sql`
        DROP TABLE IF EXISTS test;
    `.execute();
    await postgresStore.sql`
      CREATE TABLE IF NOT EXISTS test
        (
            id         VARCHAR(255) PRIMARY KEY,
            name       VARCHAR(255),
            created_at BIGINT,
            updated_at BIGINT
        );
    `.execute();
  });

  afterAll(async () => {
    await postgresStore.sql`
        DROP TABLE IF EXISTS test;
      `.execute();
  });

  it("should be able to create a new entity", async () => {
    const dto = {
      name: "John",
    };
    const result = await postgresStore.set("test", "1", dto);
    const [res] = await postgresStore.sql`SELECT * FROM test`.execute();
    expect(res).toEqual({
      id: "1",
      name: "John",
      updatedAt: expect.any(BigInt),
      createdAt: expect.any(BigInt),
    });
    expect(res).toEqual(result);
  });

  it("should be able to update an existing entity", async () => {
    const dto = {
      name: "John",
    };
    await postgresStore.set("test", "2", dto);
    const [initial] =
      await postgresStore.sql`SELECT * FROM test where id = '2'`.execute();
    const update = {
      name: "Jane",
    };
    await postgresStore.set("test", "2", update);
    const [res] =
      await postgresStore.sql`SELECT * FROM test where id = '2'`.execute();
    expect(res).toEqual({
      id: "2",
      name: "Jane",
      updatedAt: expect.any(BigInt),
      createdAt: initial.createdAt,
    });
  });

  it("should be able to get an existing entity", async () => {
    const dto = {
      name: "John",
    };
    await postgresStore.set("test", "3", dto);
    const res = await postgresStore.get("test", "1");
    expect(res).toEqual({
      id: "1",
      name: "John",
      updatedAt: expect.any(BigInt),
      createdAt: expect.any(BigInt),
    });
  });
});
