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
      `CREATE TABLE IF NOT EXISTS test (id TEXT PRIMARY KEY, name TEXT)`
    );
  });

  it("should be able to generate an insert statement for schema", () => {
    const insertStatement = store.getInsertStatementForModel(
      "test",
      testSchema
    );
    expect(insertStatement).toEqual(
      "INSERT INTO test (id, name) VALUES ($id, $name)"
    );
  });
});
