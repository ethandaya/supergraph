import { CrudEntity, Store } from "../core/engine";

export class TinybirdStore implements Store {
  table(entity: string): any {
    return `heaps_nounsdao_${entity}`;
  }
  async set<T>(
    entity: string,
    id: string | number,
    data: T
  ): Promise<CrudEntity<T>> {
    const table = this.table(entity);
    console.log(`set ${table} ${id} ${JSON.stringify(data)}`);
    return {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}

export const store = new TinybirdStore();
