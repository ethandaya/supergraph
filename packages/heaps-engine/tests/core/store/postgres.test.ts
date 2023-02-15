import { z } from "zod";
import { PostgresStore } from "../../../src";
import { beforeAll, describe, expect, it } from "vitest";

const baseSchema = z.object({
  id: z.string(),
  createdAt: z.bigint(),
  updatedAt: z.bigint(),
});

const testSchema = baseSchema.extend({
  name: z.string(),
});

const secondTestSchema = baseSchema.extend({
  isTest: z.boolean(),
  myNullableField: z.string().nullable(),
  myBigInt: z.bigint(),
});

async function initializeDB(store: PostgresStore<any>) {
  // language=PostgreSQL
  await store.sql`
        DROP TABLE IF EXISTS test;
    `.execute();
  // language=PostgreSQL
  await store.sql`
        CREATE TABLE IF NOT EXISTS test
        (
            id         VARCHAR(255) PRIMARY KEY,
            name       VARCHAR(255),
            created_at BIGINT,
            updated_at BIGINT
        );
    `.execute();
  // language=PostgreSQL
  await store.sql`
      CREATE TABLE IF NOT EXISTS second_test
      (
          id                VARCHAR(255) PRIMARY KEY,
          is_test           BOOLEAN,
          my_nullable_field TEXT,
          my_big_int        NUMERIC(78, 0)
      );
  `.execute();
}

describe("Postgres Store", () => {
  let store: PostgresStore<"test" | "secondTest">;

  beforeAll(async () => {
    store = new PostgresStore(
      "postgresql://postgres:postgres@localhost:5432/postgres",
      {
        test: testSchema,
        secondTest: secondTestSchema,
      }
    );
    return initializeDB(store);
  });

  it("should be able to generate an insert statement for schema", async () => {
    expect.assertions(1);
    const dto = {
      id: "1",
      name: "test",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const statement = store.getUpsertStatementForModel("test", testSchema);
    const query = await statement(dto).describe();
    expect(query.string).toMatchInlineSnapshot(
      '"INSERT INTO \\"test\\" (\\"id\\",\\"created_at\\",\\"updated_at\\",\\"name\\")values($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET \\"updated_at\\"=$5,\\"name\\"=$6 WHERE \\"test\\".id = $7"'
    );
  });

  it("should be able to generate a get statement for schema", async () => {
    expect.assertions(1);
    const dto = {
      id: "1",
      name: "test",
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };
    const statement = store.getSelectStatementForModel("test");
    const res = await statement(dto).describe();
    expect(res.string).toMatchInlineSnapshot(
      '"select * from \\"test\\" where id = $1 limit 1"'
    );
  });

  it("should be able to set and get a record", async () => {
    expect.assertions(1);
    const dto = {
      id: "1",
      name: "test",
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };
    await store.set("test", "1", dto);
    const res = store.sql`select *
                              from "test"
                              where id = ${dto.id}
                              limit 1`;
    const result = await res.execute();
    expect(result[0]).toEqual(dto);
  });
});
