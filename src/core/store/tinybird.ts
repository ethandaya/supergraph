import { CrudEntity, Store } from "../engine";

export class TinybirdStore implements Store {
  table(entity: string): any {
    return `heaps_nounsdao_${entity}`;
  }
  set<T>(entity: string, id: string, data: T): CrudEntity<T> {
    const table = this.table(entity);
    console.log(`set ${table} ${id} ${JSON.stringify(data)}`);
    return {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  get<T>(entity: string, id: string): T {
    const table = this.table(entity);
    console.log(`get ${table} ${id}`);
    return {
      id,
    } as T;
  }
}
