import { CrudEntity, Store } from "../engine";

export class TinybirdStore implements Store {
  table(entity: string): any {
    return `heaps_nounsdao_${entity}`;
  }
  async set<T>(entity: string, id: string, data: T): Promise<CrudEntity<T>> {
    const table = this.table(entity);
    console.log(`set ${table} ${id} ${JSON.stringify(data)}`);
    return {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  async get<T>(entity: string, id: string): Promise<T> {
    const table = this.table(entity);
    console.log(`get ${table} ${id}`);
    return {
      id,
    } as T;
  }
}
