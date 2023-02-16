import Database from "better-sqlite3";
import { z } from "zod";
import {
  BaseStore,
  CrudData,
  CrudDto,
  ModelLookup,
  SchemaLookup,
  SyncStore,
} from "../store";
import { StoreType } from "../entity";
import { StatementLookup } from "./common";

export class SqliteStore<
    H extends string,
    E extends ModelLookup<H>,
    A extends keyof E = keyof E
  >
  extends BaseStore<H, E, A>
  implements SyncStore<H, E, A>
{
  type = StoreType.SYNC;
  waitForCommit = false;
  public batch: any[] = [];
  public db: Database.Database;

  public stmts: StatementLookup<H, string>;

  constructor(public readonly models: SchemaLookup<H, E>) {
    super();
    this.db = new Database(process.env.STORE_URL || ":memory:", {
      // verbose: console.log,
    });
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
      .filter((key) => key !== "id" && key !== "createdAt")
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
    return this.db.prepare(this.stmts[entity].select).get({ id });
  }
  set(
    entity: H,
    id: string | number,
    data: CrudDto<E[A]["type"]>
  ): CrudData<E[A]["type"]> {
    const stmts = this.stmts[entity];
    const model = this.models[entity];
    model.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);
    const dto = this.prepForSave({ id, ...data });
    if (this.waitForCommit) {
      // TODO - gonna need in mem update for this
      this.batch.push({ stmt: stmts.upsert, dto });
      return dto;
    }
    this.db.prepare(stmts.upsert).run(dto);
    // TODO - add mature logic to discern data updates in mem
    return this.db.prepare(stmts.select).get({ id });
  }

  startBatch() {
    // TODO - handle if batch started but not committed
    this.waitForCommit = true;
  }

  commitBatch() {
    const batch = this.batch;
    this.batch = [];
    const runner = this.db.transaction((batch) => {
      for (const { stmt, dto } of batch) {
        this.db.prepare(stmt).run(dto);
      }
    });
    try {
      runner(batch);
      this.batch = [];
    } catch (e) {
      console.error(e);
      this.batch = [...batch, ...this.batch];
    }

    this.waitForCommit = false;
  }
}
