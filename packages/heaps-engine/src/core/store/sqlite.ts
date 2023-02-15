import Database from "better-sqlite3";
import { z } from "zod";
import { CrudEntity, Store } from "../engine";
import { ModelLookup, StatementLookup, StoreMeta } from "./common";

export class SQLiteStore<
  K extends string,
  T extends ModelLookup<K> = ModelLookup<K>
> implements Store
{
  public db: Database.Database;
  public stmts: StatementLookup<K, string>;

  public meta: StoreMeta = {
    name: "sqlite",
    description: "SQLite store",
    type: "sync",
  };

  constructor(public readonly models: T) {
    this.db = new Database(process.env.STORE_PATH || ":memory:");
    this.db.pragma("journal_mode = WAL");
    this.db.defaultSafeIntegers();
    this.stmts = this.prepareStatements(models);
  }

  prepareStatements(models: T) {
    const stmts: StatementLookup<K, string> = {} as StatementLookup<K, string>;
    for (const [tableName, model] of Object.entries<z.AnyZodObject>(models)) {
      stmts[tableName as K] = {
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

  set<T extends Record<string, any>>(
    entity: K,
    id: string | number,
    data: T
  ): CrudEntity<T> {
    const stmts = this.stmts[entity];
    const dto = {
      id,
      ...data,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };
    this.db.prepare(stmts.upsert).run(dto);
    return dto;
  }

  get<J extends Record<string, any>>(
    entity: K,
    id: string | number
  ): CrudEntity<J> {
    const dto = this.db.prepare(this.stmts[entity].select).get({ id });
    return dto;
  }
}
