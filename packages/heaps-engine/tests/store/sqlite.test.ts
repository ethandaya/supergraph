import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { baseSchema } from "../../src/entity";
import { z } from "zod";
import { SqliteStore } from "../../src";

const testSchema = baseSchema.extend({
  name: z.string(),
});
describe("SQLite Store", () => {
  let sqliteStore: SqliteStore<"test", { test: typeof testSchema }>;

  beforeAll(() => {
    vi.useFakeTimers();
    sqliteStore = new SqliteStore<"test", { test: typeof testSchema }>({
      test: testSchema,
    });
    sqliteStore.db.exec(`DROP TABLE IF EXISTS test`);
    sqliteStore.db.exec(
      `CREATE TABLE IF NOT EXISTS test
             (
                 id        TEXT PRIMARY KEY,
                 name      TEXT,
                 updatedAt INTEGER,
                 createdAt INTEGER
             )`
    );
  });

  beforeEach(() => {
    sqliteStore.db.exec(`DELETE FROM test`);
  });

  it("should be able to create a new entity", () => {
    const dto = {
      name: "John",
    };
    sqliteStore.set("test", "1", dto);
    const res = sqliteStore.db.prepare("SELECT * FROM test").get();
    expect(res).toEqual({
      id: "1",
      name: "John",
      updatedAt: expect.any(BigInt),
      createdAt: expect.any(BigInt),
    });
  });

  it("should be able to update an existing entity", () => {
    const dto = {
      name: "John",
    };
    sqliteStore.set("test", "1", dto);
    const initial = sqliteStore.db.prepare("SELECT * FROM test").get();
    const update = {
      ...initial,
      name: "Jane",
    };
    vi.advanceTimersByTime(100);
    sqliteStore.set("test", "1", update);
    const res = sqliteStore.db.prepare("SELECT * FROM test").get();
    expect(res).toEqual({
      id: "1",
      name: "Jane",
      updatedAt: expect.any(BigInt),
      createdAt: initial.createdAt,
    });
  });

  it("should be able to get an existing entity", () => {
    const dto = {
      name: "John",
    };
    sqliteStore.set("test", "1", dto);
    const res = sqliteStore.get("test", "1");
    expect(res).toEqual({
      id: "1",
      name: "John",
      updatedAt: expect.any(BigInt),
      createdAt: expect.any(BigInt),
    });
  });
});
