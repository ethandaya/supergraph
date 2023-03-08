import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { baseSchema, PostgresStore } from "../../src";
import { z } from "zod";

const testSchema = baseSchema.extend({
  name: z.string(),
  maxQuorumVotesBPS: z.coerce.bigint().array(),
});

type Test = z.infer<typeof testSchema>;

describe("Postgres Store", () => {
  let postgresStore: PostgresStore<"test", { test: typeof testSchema }>;

  beforeAll(async () => {
    vi.stubEnv(
      "STORE_URL",
      "postgres://postgres:postgres@localhost:5432/postgres"
    );
    postgresStore = new PostgresStore<"test", { test: typeof testSchema }>({
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
            "maxQuorumVotesBPS" NUMERIC(78, 0)[],
            "createdAt" BIGINT,
            "updatedAt" BIGINT
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
      maxQuorumVotesBPS: [
        115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      ],
    };
    const res: Test = await postgresStore.set("test", "1", dto);
    // TODO: add raw retrieval and compare
    expect(res).toEqual({
      id: "1",
      ...dto,
      updatedAt: expect.any(BigInt),
      createdAt: expect.any(BigInt),
    });
  });

  it("should be able to update an existing entity", async () => {
    const dto = {
      name: "John",
      maxQuorumVotesBPS: [16969696n],
    };
    const initial = await postgresStore.set("test", "2", dto);
    const update = {
      ...initial,
      name: "Jane",
      maxQuorumVotesBPS: [16969696n, 2892282n],
    };
    const res = await postgresStore.set("test", "2", update);
    expect(res).toEqual({
      id: "2",
      name: "Jane",
      maxQuorumVotesBPS: [16969696n, 2892282n],
      updatedAt: expect.any(BigInt),
      createdAt: initial.createdAt,
    });
  });

  it("should be able to get an existing entity", async () => {
    const dto = {
      name: "John",
      maxQuorumVotesBPS: [16969696n, 2892282n],
    };
    await postgresStore.set("test", "3", dto);
    const res = await postgresStore.get("test", "3");
    expect(res).toEqual({
      id: "3",
      name: "John",
      maxQuorumVotesBPS: [16969696n, 2892282n],
      updatedAt: expect.any(BigInt),
      createdAt: expect.any(BigInt),
    });
  });
});
