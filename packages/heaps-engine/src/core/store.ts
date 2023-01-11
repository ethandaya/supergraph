import Database from "better-sqlite3";
import { z } from "zod";
import { CrudEntity, Store } from "./engine";

export type ModelLookup<T extends string> = {
  [key in T]: z.AnyZodObject;
};

export type StatementLookup<T extends string> = {
  [key in T]: {
    insert: string;
    update: string;
    select: string;
  };
};

export type StoredEntity<K, T extends keyof K = keyof K> = {
  [key in T]: string | number | bigint | null;
};

export class SQLiteStore<
  K extends string,
  T extends ModelLookup<K> = ModelLookup<K>
> implements Store
{
  public db: Database.Database;
  public stmts: StatementLookup<K>;

  constructor(pathToDb: string, public readonly models: T) {
    this.db = new Database(pathToDb);
    this.stmts = this.prepareStatements(models);
  }

  prepareStatements(models: T) {
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
    const stmts = this.stmts[entity];
    const dto = this.castEntity(this.models[entity], {
      ...data,
      id: id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    this.db.prepare(stmts.insert).run(dto);
    return this.db.prepare(stmts.select).get({ id: id });
  }

  get<J extends Record<string, any>>(
    entity: K,
    id: string | number
  ): CrudEntity<J> {
    const model = this.models[entity];
    const stored = this.db.prepare(this.stmts[entity].select).get({ id: id });
    const hydrated = this.uncastEntity(model, stored);
    return { ...stored, ...hydrated };
  }

  uncastEntity<
    O extends z.AnyZodObject,
    T extends z.infer<O> = z.infer<O>,
    E extends StoredEntity<T> = StoredEntity<T>
  >(schema: O, data: E) {
    // TODO - consolidate both cast & uncast
    // TODO - also make these methods not trash
    const keys: (keyof E)[] = Object.keys(data).filter(
      (k) => k !== "createdAt" && k !== "updatedAt"
    );
    return keys.reduce(
      (acc, key) => ({
        ...acc,
        [key]: hydrateKeyPair<E[keyof E], O>(data[key], schema.shape[key]),
      }),
      data
    );
  }

  castEntity<
    O extends z.AnyZodObject,
    T extends z.infer<O> = z.infer<O>,
    E extends CrudEntity<T> = CrudEntity<T>
  >(schema: O, data: E) {
    const keys: (keyof E)[] = Object.keys(data).filter(
      (k) => k !== "createdAt" && k !== "updatedAt"
    );
    return keys.reduce(
      (acc, key) => ({
        ...acc,
        [key]: castKeyPair<E[keyof E], O>(data[key], schema.shape[key]),
      }),
      data
    );
  }
}

function castKeyPair<
  T extends string | number | bigint | null,
  K extends z.ZodTypeAny
>(data: T, target: K) {
  // TODO - handle more types more maturely
  const typename = target._def.typeName;
  switch (typeof data) {
    case "string":
    case "number":
    case "bigint":
    case "object":
      if (data === null) {
        return data;
      }
      return data;
    case "boolean":
      if (typename === z.ZodFirstPartyTypeKind.ZodBoolean) {
        return data ? 1 : 0;
      }
  }
  return data;
}

function hydrateKeyPair<
  T extends string | number | bigint | null,
  K extends z.ZodTypeAny
>(data: T, target: K) {
  // TODO - handle more types more maturely
  const typename = target._def.typeName;
  switch (typeof data) {
    case "string":
    case "number":
      if (typename === z.ZodFirstPartyTypeKind.ZodBoolean) {
        return data === 1;
      }
      return data;
    case "bigint":
    case "object":
      if (data === null) {
        return data;
      }
  }
  return data;
}
