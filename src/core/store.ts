import { Database } from "bun:sqlite";
import { z } from "zod";
import { CrudEntity } from "./engine";

type ModelLookup<T extends string> = {
  [key in T]: z.AnyZodObject;
};

type StatementLookup<T extends string> = {
  [key in T]: {
    insert: string;
    update: string;
    select: string;
  };
};

export class SQLiteStore<K extends string> {
  public db: Database;
  public stmts: StatementLookup<K>;

  constructor(pathToDb: string, public readonly models: ModelLookup<K>) {
    this.db = new Database(pathToDb);
    this.stmts = this.prepareStatements(models);
  }

  prepareStatements(models: ModelLookup<K>) {
    const stmts: StatementLookup<K> = {} as StatementLookup<K>;
    for (const [tableName, model] of Object.entries<z.AnyZodObject>(models)) {
      stmts[tableName as K] = {
        insert: this.getInsertStatementForModel(tableName, model),
        update: this.getUpdateStatementForModel(tableName, model),
        select: this.getSelectStatementForModel(tableName),
      };
    }
    return stmts;
  }

  getInsertStatementForModel(tableName: string, model: z.AnyZodObject): string {
    const values = Object.keys(model.shape).concat(["createdAt", "updatedAt"]);
    const cols = values.join(", ");
    const params = values.map((key) => `$${key}`).join(", ");
    return `INSERT INTO ${tableName} (${cols}) VALUES (${params})`;
  }

  getUpdateStatementForModel(tableName: string, model: z.AnyZodObject): string {
    const values = Object.keys(model.shape);
    const sets = values
      .filter((key) => key !== "id")
      .map((key) => `${key} = $${key}`)
      .concat(["updatedAt = $updatedAt"])
      .join(", ");
    return `UPDATE ${tableName} SET ${sets} WHERE id = $id`;
  }

  getSelectStatementForModel(tableName: string): string {
    return `SELECT * FROM ${tableName} WHERE id = $id LIMIT 1`;
  }

  set<T extends Record<string, any>>(
    entity: K,
    id: string | number,
    data: T
  ): CrudEntity<T> {
    const params = Object.keys(data).reduce(
      (acc, key: string) => ({
        ...acc,
        [`$${key}`]: data[key],
      }),
      {}
    );
    const stmts = this.stmts[entity];
    this.db.prepare(stmts.insert).run({
      ...params,
      $id: id,
      $createdAt: Date.now(),
      $updatedAt: Date.now(),
    });
    return this.db.prepare(stmts.select).get({ $id: id });
  }
}
