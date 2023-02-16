import { z } from "zod";
import { AsyncStore, CrudData, SyncStore } from "./store";

export enum StoreType {
  SYNC = "sync",
  ASYNC = "async",
}

export const baseSchema = z.object({
  id: z.string(),
  updatedAt: z.bigint(),
  createdAt: z.bigint(),
});

type LocalData<T, K = CrudData<T>> = K | Partial<K>;

export class BaseCrudEntity<
  J extends string,
  T extends {},
  K extends z.ZodTypeAny
> {
  public _id: string;
  public _data: LocalData<T> = {};
  public _name: J;
  public _schema: K;

  constructor(id: string, name: J, schema: K) {
    this._id = id;
    this._name = name;
    this._schema = schema;
  }

  public set<K extends keyof LocalData<T>>(
    key: K,
    value: LocalData<T>[typeof key]
  ) {
    this._data = { ...this._data, [key]: value };
    return value;
  }

  public unset<K extends keyof LocalData<T>>(key: K) {
    this._data = { ...this._data, [key]: null };
  }

  public get<K extends keyof LocalData<T>>(key: K): LocalData<T>[typeof key] {
    return this._data[key];
  }
}

export class SyncCrudEntity<
  J extends string,
  T extends {},
  K extends z.ZodTypeAny
> extends BaseCrudEntity<J, T, K> {
  constructor(
    id: string,
    name: J,
    schema: K,
    private readonly _store: SyncStore<J, any>
  ) {
    super(id, name, schema);
  }
  save() {
    const res = this._store.set(this._name, this._id, this._data);
    this._data = res;
    return res;
  }
}

export class AsyncCrudEntity<
  J extends string,
  T extends {},
  K extends z.AnyZodObject
> extends BaseCrudEntity<J, T, K> {
  constructor(
    id: string,
    name: J,
    schema: K,
    private readonly _store: AsyncStore<J, any>
  ) {
    super(id, name, schema);
  }
  async save() {
    const res = await this._store.set(this._name, this._id, this._data);
    this._data = res;
    return res;
  }
}
