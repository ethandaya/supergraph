import { beforeEach, describe, it } from "vitest";
import {
  CrudData,
  ModelLookup,
  SchemaLookup,
  SyncStore,
} from "../../src/core/store";
import { StoreType } from "../../src/core/entity";
import { z } from "zod";
import Database from "better-sqlite3";

class SqliteStore<
  H extends string,
  E extends ModelLookup<H>,
  A extends keyof E = keyof E
> implements SyncStore<H, E, A>
{
  type = StoreType.SYNC;
  public db: Database.Database;

  constructor(public readonly models: SchemaLookup<H, E>) {
    this.db = new Database(process.env.STORE_PATH || ":memory:");
    this.db.pragma("journal_mode = WAL");
    this.db.defaultSafeIntegers();
  }

  get(entity: H, id: string | number): CrudData<E[A]["type"]> | null {
    console.log(entity, id);
    return null;
  }
  set(
    entity: H,
    id: string | number,
    data: E[A]["type"]
  ): CrudData<E[A]["type"]> {
    console.log(entity, id, data);
    const model = this.models[entity];
    model.parse(data);
    return data;
  }
}

const testSchema = z.object({
  name: z.string(),
});

describe("Entity", () => {
  let sqliteStore: SqliteStore<
    "test",
    { test: { type: z.infer<typeof testSchema>; schema: typeof testSchema } }
  >;

  beforeEach(() => {
    sqliteStore = new SqliteStore({
      test: testSchema,
    });
  });

  it("should be able to create a new entity", () => {
    sqliteStore.set("test", "1", { name: "John" });
  });
});
