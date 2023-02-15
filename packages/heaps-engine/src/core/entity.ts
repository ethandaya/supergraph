import { z } from "zod";

export enum StoreType {
  SYNC = "sync",
  ASYNC = "async",
}
export interface SyncStore {
  type: StoreType;
  set<T extends {}>(table: string, id: string | number, dto: T): CrudData<T>;
}
export interface AsyncStore {
  type: StoreType;
  set<T extends {}>(
    table: string,
    id: string | number,
    dto: T
  ): Promise<CrudData<T>>;
}

export const baseSchema = z.object({
  id: z.string(),
  updatedAt: z.bigint(),
  createdAt: z.bigint(),
});

type CrudData<T> = T & {
  createdAt?: bigint;
  updatedAt?: bigint;
};
type LocalData<T, K = CrudData<T>> = K | Partial<K>;

export class BaseCrudEntity<T extends {}, K extends z.ZodTypeAny> {
  public _id: string;
  public _data: LocalData<T> = {};
  public _name: string = this.constructor.name.toLowerCase();
  public _schema: K;

  constructor(id: string, schema: K) {
    this._id = id;
    this._schema = schema;
  }

  protected prepForSave(data: LocalData<T>): LocalData<T> {
    const now = BigInt(Date.now());
    if (data.createdAt) {
      data.updatedAt = now;
    } else {
      data.createdAt = now;
      data.updatedAt = now;
    }
    return data;
  }
}

export class SyncCrudEntity<
  T extends {},
  K extends z.ZodTypeAny
> extends BaseCrudEntity<T, K> {
  constructor(id: string, schema: K, private readonly _store: SyncStore) {
    super(id, schema);
  }
  save() {
    const dto: T = this._schema.parse(
      this.prepForSave({ id: this._id, ...this._data })
    );
    const res = this._store.set<CrudData<T>>(this._name, this._id, dto);
    this._data = res;
    return res;
  }
}

export class AsyncCrudEntity<
  T extends {},
  K extends z.ZodTypeAny
> extends BaseCrudEntity<T, K> {
  constructor(id: string, schema: K, private readonly _store: AsyncStore) {
    super(id, schema);
  }
  async save() {
    const dto: T = this._schema.parse(
      this.prepForSave({ id: this._id, ...this._data })
    );
    return this._store.set<T>(this._name, this._id, dto);
  }
}
