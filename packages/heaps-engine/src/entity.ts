import { z } from "zod";

export enum StoreType {
  SYNC = "sync",
  ASYNC = "async",
}

export const baseSchema = z.object({
  id: z.string(),
  updatedAt: z.bigint().or(z.number()),
  createdAt: z.bigint().or(z.number()),
});

type LocalData<T> = T | Partial<T>;

export class CrudEntity<
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
