import { AsyncStore, StoreType, SyncStore } from "../../src/core/entity";

export class AsyncTestStore implements AsyncStore {
  type: StoreType = StoreType.ASYNC;
  data: Record<string, Record<string, any>> = {};
  set<T>(name: string, id: string, data: T): Promise<T> {
    console.log(`set ${name} ${id}`);
    this.data[name] = this.data[name] || {};
    this.data[name][id] = data;
    return Promise.resolve(this.data[name][id]);
  }
  get<T>(name: string, id: string): Promise<T> {
    console.log(`get ${name} ${id}`);
    this.data[name] = this.data[name] || {};
    return Promise.resolve(this.data[name][id]);
  }
}

export class TestStore implements SyncStore {
  type: StoreType = StoreType.SYNC;
  data: Record<string, Record<string, any>> = {};
  set<T>(name: string, id: string, data: T): T {
    console.log(`set ${name} ${id}`);
    this.data[name] = this.data[name] || {};
    this.data[name][id] = data;
    return this.data[name][id];
  }
  get<T>(name: string, id: string): T {
    console.log(`get ${name} ${id}`);
    this.data[name] = this.data[name] || {};
    return this.data[name][id];
  }
}
