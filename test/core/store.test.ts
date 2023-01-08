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
});
