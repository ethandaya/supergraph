import { z } from "zod";

export type CrudEntity<T> = T & {
  createdAt?: number;
  updatedAt?: number;
};

export class KeyAccessError<T> extends Error {
  constructor(key: keyof T) {
    super(`${String(key)} accessed before set`);
  }
}

export interface Store {
  set<T extends {}>(table: string, id: string | number, dto: T): CrudEntity<T>;
  // get<T>(table: string, pk: string | number): Promise<CrudEntity<T>>;
  // setMany(values: { [key: string]: any }): void;
}

type TempData<T> = T | Partial<T>;

export class Entity<T extends { id: string }> {
  public data: TempData<T> = {};

  constructor(
    pk: string,
    private readonly schema: z.ZodSchema<T>,
    private readonly store: Store
  ) {
    this.id = pk;
  }

  get id(): T["id"] {
    const value = this.get("id");
    if (!value) {
      throw new KeyAccessError<T>("id");
    }

    return value;
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

  save(): CrudEntity<T> {
    const dto = this.schema.parse({ id: this.id, ...this.data });
    return this.store.set<T>("seed", this.id, dto);
  }
}
