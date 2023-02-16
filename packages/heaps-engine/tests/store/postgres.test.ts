import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { baseSchema } from "../../src/entity";
import { z } from "zod";
import { PostgresStore } from "../../src";

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

  it("should be able to batch writes", async () => {
    const dto = {
      name: "John",
    };
    const dto2 = {
      name: "Jane",
    };
    await postgresStore.startBatch();
    const dto1Res = await postgresStore.set("test", "1", dto);
    const snap = [...postgresStore.batch];
    const dto2Res = await postgresStore.set("test", "2", dto2);
    const snap2 = [...postgresStore.batch];
    await postgresStore.commitBatch();
    const snap3 = [...postgresStore.batch];
    expect(snap).toEqual([
      {
        stmt: postgresStore.stmts.test.upsert,
        dto: dto1Res,
      },
    ]);
    expect(snap2).toEqual([
      {
        stmt: postgresStore.stmts.test.upsert,
        dto: dto1Res,
      },
      {
        stmt: postgresStore.stmts.test.upsert,
        dto: dto2Res,
      },
    ]);
    expect(snap3).toEqual([]);
  });
});
