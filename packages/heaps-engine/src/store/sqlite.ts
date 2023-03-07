import Database from "better-sqlite3";
import { BaseStore, CrudDto, SyncStore } from "../store";
import { StoreType } from "../entity";
import { ModelLookup } from "./common";
import { z } from "zod";

export class SqliteStore<
    H extends string,
    E extends ModelLookup<H> = ModelLookup<H>,
    A extends keyof E = keyof E
  >
  extends BaseStore<E, A>
  implements SyncStore<E, A>
{
  type = StoreType.SYNC;
  waitForCommit = false;
  public batch: any[] = [];
  public db: Database.Database;

  constructor(public readonly models: E) {
    super(models);
    this.db = new Database(process.env.STORE_URL || ":memory:", {
      // verbose: console.log,
    });
    this.db.pragma("journal_mode = WAL");
    this.db.defaultSafeIntegers();
  }

  get<J extends A = A>(entity: J, id: string): z.infer<E[J]> | null {
    const model: E[J] = this.models[entity];
    const row = this.db
      .prepare(
        `SELECT *
                 FROM ${String(entity)}
                 WHERE id = $id`
      )
      .get({ id });
    if (!row) {
      return null;
    }
    return model.parse(row);
  }

  set<J extends A = A>(
    entity: J,
    id: string,
    data: CrudDto<z.infer<E[J]>>
  ): z.infer<E[J]> {
    const model: E[J] = this.models[entity];
    const dto: z.infer<E[J]> = model.parse(
      this.prepForSave({
        id,
        ...data,
      })
    );
    const insert = this.serialize<J>(entity, dto);
    const insertKeys = Object.keys(insert).join(",");
    const insertParams = Object.keys(insert)
      .map((key) => `$${key}`)
      .join(",");
    const updateKeys = Object.keys(insert)
      .filter((key) => key !== "id")
      .map((key) => `${key} = $${key}`)
      .join(",");

    this.db
      .prepare(
        `INSERT INTO ${String(entity)} (${insertKeys})
                 VALUES (${insertParams})
                 ON CONFLICT (id) DO UPDATE SET ${updateKeys}
                 WHERE id = $id`
      )
      .run(insert);

    return dto;
  }

  //
  // prepareStatements(models: ModelSchemaLookup<H, E>) {
  //   const keys: H[] = Object.keys(models) as H[];
  //   return keys.reduce<P>(
  //     (acc, key) => ({
  //       ...acc,
  //       [key]: {
  //         upsert: this.getUpsertStatementForModel(key, models[key]),
  //         select: this.getSelectStatementForModel(key),
  //       },
  //     }),
  //     {} as P
  //   );
  // }
  //
  // getUpsertStatementForModel(tableName: string, model: z.AnyZodObject): string {
  //   const values = Object.keys(model.shape).concat(["createdAt", "updatedAt"]);
  //   const cols = values.join(", ");
  //   const params = values.map((key) => `$${key}`).join(", ");
  //   // language=SQL format=false
  //   return `INSERT INTO ${tableName} (${cols}) VALUES (${params}) ON CONFLICT (id) DO ${this.getUpdateStatementForModel(
  //     model
  //   )}`;
  // }
  //
  // getUpdateStatementForModel(model: z.AnyZodObject): string {
  //   const values = Object.keys(model.shape);
  //   const sets = values
  //     .filter((key) => key !== "id" && key !== "createdAt")
  //     .map((key) => `${key} = $${key}`)
  //     .concat(["updatedAt = $updatedAt"])
  //     .join(", ");
  //   // language=SQL format=false
  //   return `UPDATE SET ${sets} WHERE id = $id`;
  // }
  //
  // getSelectStatementForModel(tableName: string): string {
  //   // language=SQL format=false
  //   return `SELECT * FROM ${tableName} WHERE id = $id LIMIT 1`;
  // }

  // set<J extends A = A>(
  //   entity: J,
  //   id: string | number,
  //   data: CrudDto<E[J]["type"]>
  // ): CrudData<E[J]["type"]> {
  //   const stmts = this.stmts[entity];
  //   const model = this.models[entity];
  //   model.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);
  //   const dto = this.prepForSave({ id, ...data });
  //   if (this.waitForCommit) {
  //     // TODO - gonna need in mem update for this
  //     this.batch.push({ stmt: stmts.upsert, dto });
  //     return dto;
  //   }
  //   this.db.prepare(stmts.upsert).run(dto);
  //   // TODO - add mature logic to discern data updates in mem
  //   return this.db.prepare(stmts.select).get({ id });
  // }
}
