import { beforeEach, describe, expect, it } from "bun:test";
import { SQLiteStore } from "../../src/core/store";
import { z } from "zod";

const testSchema = z.object({
  id: z.string(),
  name: z.string(),
});

describe("Store", () => {
  let store: SQLiteStore<"test">;

  beforeEach(() => {
    store = new SQLiteStore("", {
      test: testSchema,
    });
    store.db.exec(
      `CREATE TABLE IF NOT EXISTS test
       (
           id        TEXT PRIMARY KEY,
           name      TEXT,
           updatedAt INTEGER,
           createdAt INTEGER
       )`
    );
  });

  it("should be able to generate an insert statement for schema", () => {
    const insertStatement = store.getInsertStatementForModel(
      "test",
      testSchema
    );
    expect(insertStatement).toEqual(
      "INSERT INTO test (id, name, createdAt, updatedAt) VALUES ($id, $name, $createdAt, $updatedAt)"
    );
  });

  it("should be able to generate an update statement for schema", () => {
    const updateStatement = store.getUpdateStatementForModel(
      "test",
      testSchema
    );
    expect(updateStatement).toEqual(
      "UPDATE test SET name = $name, updatedAt = $updatedAt WHERE id = $id"
    );
  });

  it("should be able to generate a select statement for schema", () => {
    const selectStatement = store.getSelectStatementForModel("test");
    expect(selectStatement).toEqual(
      "SELECT * FROM test WHERE id = $id LIMIT 1"
    );
  });

  it("should be able to prepare statements for all models", () => {
    expect(store.stmts).toEqual({
      test: {
        insert: store.getInsertStatementForModel("test", testSchema),
        update: store.getUpdateStatementForModel("test", testSchema),
        select: store.getSelectStatementForModel("test"),
      },
    });
  });

  it("should be able to set an entity", () => {
    const dto = store.set("test", "1", { name: "test" });

    const createdAt = dto.createdAt;
    const updatedAt = dto.updatedAt;

    const result = store.db
      .query("SELECT * FROM test WHERE id = '1' LIMIT 1")
      .get();

    expect(dto).toEqual(result);

    expect(createdAt).toBeLessThanOrEqual(Date.now());
    expect(updatedAt).toBeLessThanOrEqual(Date.now());
  });

  it("should be able to get an entity", () => {
    store.set("test", "1", { name: "test" });
    const result = store.db
      .query("SELECT * FROM test WHERE id = '1' LIMIT 1")
      .get();
    const dto = store.get("test", "1");
    expect(dto).toEqual(result);
  });
});
