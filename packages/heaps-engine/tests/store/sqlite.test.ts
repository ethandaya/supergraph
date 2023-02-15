import { beforeEach, describe, expect, it } from "vitest";
import {
  BaseStore,
  CrudData,
  CrudDto,
  ModelLookup,
  SchemaLookup,
  SyncStore,
} from "../../src/core/store";
import { baseSchema, StoreType } from "../../src/core/entity";
import { z } from "zod";
import Database from "better-sqlite3";
import { StatementLookup } from "../../src";

class SqliteStore<
    H extends string,
    E extends ModelLookup<H>,
    A extends keyof E = keyof E
  >
  extends BaseStore<H, E, A>
  implements SyncStore<H, E, A>
{
  type = StoreType.SYNC;
  public db: Database.Database;

  public stmts: StatementLookup<H, string>;

  constructor(public readonly models: SchemaLookup<H, E>) {
    super();
    this.db = new Database(process.env.STORE_PATH || ":memory:");
    this.db.pragma("journal_mode = WAL");
    this.db.defaultSafeIntegers();
    this.stmts = this.prepareStatements(models);
  }

  prepareStatements(models: SchemaLookup<H, E>) {
    const stmts: StatementLookup<H, string> = {} as StatementLookup<H, string>;
    for (const [tableName, model] of Object.entries<z.AnyZodObject>(models)) {
      stmts[tableName as H] = {
        upsert: this.getUpsertStatementForModel(tableName, model),
        select: this.getSelectStatementForModel(tableName),
      };
    }
    return stmts;
  }

  getUpsertStatementForModel(tableName: string, model: z.AnyZodObject): string {
    const values = Object.keys(model.shape).concat(["createdAt", "updatedAt"]);
    const cols = values.join(", ");
    const params = values.map((key) => `$${key}`).join(", ");
    // language=SQL format=false
    return `INSERT INTO ${tableName} (${cols}) VALUES (${params}) ON CONFLICT (id) DO ${this.getUpdateStatementForModel(
      model
    )}`;
  }

  getUpdateStatementForModel(model: z.AnyZodObject): string {
    const values = Object.keys(model.shape);
    const sets = values
      .filter((key) => key !== "id")
      .map((key) => `${key} = $${key}`)
      .concat(["updatedAt = $updatedAt"])
      .join(", ");
    // language=SQL format=false
    return `UPDATE SET ${sets} WHERE id = $id`;
  }

  getSelectStatementForModel(tableName: string): string {
    // language=SQL format=false
    return `SELECT * FROM ${tableName} WHERE id = $id LIMIT 1`;
  }

  get(entity: H, id: string | number): CrudData<E[A]["type"]> {
    console.log(entity, id);
    return {} as CrudData<E[A]["type"]>;
  }
  set(
    entity: H,
    id: string | number,
    data: CrudDto<E[A]["type"]>
  ): CrudData<E[A]["type"]> {
    const stmts = this.stmts[entity];
    const model = this.models[entity];
    model.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);
    this.db.prepare(stmts.upsert).run(this.prepForSave({ id, ...data }));
    return data;
  }
}

const testSchema = baseSchema.extend({
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
      name: "Jane",
    };
    sqliteStore.set("test", "1", update);
    const res = sqliteStore.db.prepare("SELECT * FROM test").get();
    expect(res).toEqual({
      id: "1",
      name: "Jane",
      updatedAt: expect.any(BigInt),
      createdAt: initial.createdAt,
    });
  });
});
