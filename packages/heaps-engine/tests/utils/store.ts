import {
  AsyncStore,
  BaseStore,
  CrudData,
  CrudDto,
  ModelLookup,
  SyncStore,
} from "../../src/core/store";
import { StoreType } from "../../src/core/entity";

export class AsyncTestStore<
    H extends string,
    E extends ModelLookup<H>,
    A extends keyof E = keyof E
  >
  extends BaseStore<H, E, A>
  implements AsyncStore<H, E, A>
{
  type: StoreType = StoreType.ASYNC;
  data: Record<string, Record<string, any>> = {};
  set(
    entity: H,
    id: string | number,
    data: CrudDto<E[A]["type"]>
  ): Promise<CrudData<E[A]["type"]>> {
    this.data[entity] = this.data[entity] || {};
    this.data[entity][id] = this.prepForSave(data);
    return Promise.resolve(this.data[entity][id]);
  }
  get(entity: H, id: string | number): Promise<CrudData<E[A]["type"]>> {
    this.data[entity] = this.data[entity] || {};
    return Promise.resolve(this.data[entity][id]);
  }
}

export class TestStore<
    H extends string,
    E extends ModelLookup<H>,
    A extends keyof E = keyof E
  >
  extends BaseStore<H, E, A>
  implements SyncStore<H, E, A>
{
  type: StoreType = StoreType.SYNC;
  data: Record<string, Record<string, CrudData<any>>> = {};
  set(
    entity: H,
    id: string | number,
    data: CrudDto<E[A]["type"]>
  ): CrudData<E[A]["type"]> {
    this.data[entity] = this.data[entity] || {};
    this.data[entity][id] = this.prepForSave(data);
    return this.data[entity][id];
  }
  get(entity: H, id: string | number): CrudData<E[A]["type"]> {
    this.data[entity] = this.data[entity] || {};
    return this.data[entity][id];
  }
}
