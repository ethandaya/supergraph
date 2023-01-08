import { Database } from "bun:sqlite";
import { z } from "zod";

type ModelLookup<T extends string> = {
  [key in T]: z.AnyZodObject;
};

// type StatmentLookup<T extends string> = {
//   [key in T]: {
//     insert: Statement;
//     update: Statement;
//     delete: Statement;
//     select: Statement;
//   };
// };

export class SQLiteStore<K extends string> {
  public db: Database;
  // public stmts: StatementLookup;

  constructor(pathToDb: string, public readonly models: ModelLookup<K>) {
    this.db = new Database(pathToDb);
    // this.stmts = this.prepareInsertStmts(models);
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

  //
  // private prepareInsertStmts(models: ModelLookup<K>) {
  //   const keys = Object.keys(models) as Array<keyof ModelLookup<K>>;
  //   // return keys.reduce<{ [key in K]: string }>((acc, key) => {
  //   //   const model = models[key];
  //   //   const fields = Object.keys(model.shape);
  //   //   const stmt = this.db.prepare(
  //   //     `INSERT INTO ${key} (${fields.join(",")}) VALUES (${fields
  //   //       .map((_) => "?")
  //   //       .join(",")})`
  //   //   );
  //   //   return { ...acc, [key]: stmt };
  //   // });
  // }
  // set<T extends Record<string, any>>(
  //   entity: K,
  //   id: string | number,
  //   data: T
  // ): CrudEntity<T> {
  //   const params = Object.keys(data).reduce(
  //     (acc, key: string) => ({
  //       ...acc,
  //       [`$${key}`]: data[key],
  //     }),
  //     {}
  //   );
  //   const stmt = this.stmts[entity];
  //   await stmt;
  //   return {
  //     id,
  //     ...data,
  //   };
  // }
}
