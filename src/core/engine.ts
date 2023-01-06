import { z } from "zod";

export type CrudEntity<T> = T & {
  createdAt: number;
  updatedAt: number;
};

export class KeyAccessError<T> extends Error {
  constructor(key: keyof T) {
    super(`${String(key)} accessed before set`);
  }
}

export interface Store {
  set<T>(table: string, pk: string | number, value: T): Promise<CrudEntity<T>>;
  // get<T>(table: string, pk: string | number): Promise<CrudEntity<T>>;
  // setMany(values: { [key: string]: any }): void;
}

type TempData<T> = T | Partial<T>;

export class Entity<T> {
  public id: number;
  data: TempData<T> = {};

  constructor(
    pk: number,
    private readonly schema: z.ZodSchema<T>,
    private readonly store: Store
  ) {
    this.id = pk;
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

  async save(): Promise<CrudEntity<T>> {
    const dto = this.schema.parse({ id: this.id, ...this.data });
    return this.store.set<T>("seed", this.id, dto);
  }
}

// export class Batch<K, T extends Entity<K>> {
//   _queue: T[] = [];
//
//   queue(entity: T) {
//     this._queue.push(entity);
//   }
//
//   // save() {
//   //   const dtos = this._queue.map((e: T) => e.getEntity());
//   //   console.log(`persisting batch w. len ${dtos.length} to db`);
//   // }
// }
