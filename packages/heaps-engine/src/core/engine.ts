import { z } from "zod";
import { StoreMeta } from "./store/common";

export type CrudEntity<T> = T & {
  createdAt?: bigint;
  updatedAt?: bigint;
};

export class KeyAccessError<T> extends Error {
  constructor(key: keyof T) {
    super(`${String(key)} accessed before set`);
  }
}

export interface Store {
  meta: StoreMeta;
  set<T extends {}>(table: string, id: string | number, dto: T): CrudEntity<T>;
  set<T extends {}>(
    table: string,
    id: string | number,
    dto: T
  ): Promise<CrudEntity<T>>;
}

type TempData<T> = T | Partial<T>;

export class Entity<T extends { id: string }, K extends z.ZodTypeAny> {
  public data: TempData<T> = {};

  constructor(
    id: string,
    private readonly schema: K,
    private readonly store: Store
  ) {
    this.id = id;
  }

  get id(): T["id"] {
    const value = this.get("id");
    if (typeof value === "undefined") {
      throw new KeyAccessError<T>("id");
    }
    return value as T["id"];
  }

  set id(value: T["id"]) {
    this.set("id", value);
  }

  public set<K extends keyof TempData<T>>(
    key: K,
    value: TempData<T>[typeof key]
  ) {
    this.data = { ...this.data, [key]: value };
    return value;
  }

  public unset<K extends keyof TempData<T>>(key: K) {
    this.data = { ...this.data, [key]: null };
  }

  public get<K extends keyof TempData<T>>(key: K): TempData<T>[typeof key] {
    return this.data[key];
  }

  save(): CrudEntity<T> | Promise<CrudEntity<T>> {
    const dto = this.schema.parse({ id: this.id, ...this.data });
    return this.store.set<T>(
      this.constructor.name.valueOf().toLowerCase(),
      this.id,
      dto
    );
  }
}
