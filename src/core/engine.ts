export class KeyAccessError<T extends Record<string, string>> extends Error {
  constructor(key: keyof T) {
    super(`${String(key)} accessed before set`);
  }
}

export interface Store {
  set<T extends {}>(table: string, pk: string | number, value: T): void;

  // setMany(values: { [key: string]: any }): void;
}

type LocalData<T> = T | Partial<T>;

export class Entity<T extends Record<string, string | number>> {
  pk: number;
  data: LocalData<T> = {};

  constructor(pk: number) {
    this.pk = pk;
  }

  public set<K extends keyof LocalData<T>>(
    key: K,
    value: LocalData<T>[typeof key]
  ) {
    // console.debug("setting into temp store", key, value);
    this.data = { ...this.data, [key]: value };
    return value;
  }

  public get<K extends keyof LocalData<T>>(key: K): LocalData<T>[typeof key] {
    // console.debug("getting from temp store", key);
    return this.data[key];
  }
}
//
// export class Batch<T extends Entity<T>> {
//   _queue: T[] = [];
//
//   queue(entity: T) {
//     this._queue.push(entity);
//   }
//
//   save() {
//     const dtos = this._queue.map((e: T) => e.getEntity());
//     console.log(`persisting batch w. len ${dtos.length} to db`);
//   }
// }
