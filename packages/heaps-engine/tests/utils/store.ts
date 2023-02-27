import {
  AsyncStore,
  BaseStore,
  CrudData,
  CrudDto,
  ModelLookup,
  SyncStore,
} from "../../src/store";
import { StoreType } from "../../src/entity";

export class AsyncTestStore<
    E extends ModelLookup<string>,
    A extends keyof E = keyof E
  >
  extends BaseStore<E, A>
  implements AsyncStore<E, A>
{
  type: StoreType = StoreType.ASYNC;
  // TODO - type
  data: any;
  set(
    entity: A,
    id: string | number,
    data: CrudDto<E[A]["type"]>
  ): Promise<CrudData<E[A]["type"]>> {
    this.data[entity] = this.data[entity] || {};
    this.data[entity][id] = this.prepForSave(data);
    return Promise.resolve(this.data[entity][id]);
  }
  get(entity: A, id: string | number): Promise<CrudData<E[A]["type"]>> {
    this.data[entity] = this.data[entity] || {};
    return Promise.resolve(this.data[entity][id]);
  }

  startBatch(): Promise<void> {
    return Promise.resolve();
  }

  commitBatch(): Promise<void> {
    return Promise.resolve();
  }
}

export class TestStore<
    E extends ModelLookup<string>,
    A extends keyof E = keyof E
  >
  extends BaseStore<E, A>
  implements SyncStore<E, A>
{
  type: StoreType = StoreType.SYNC;
  // TODO - type
  data: any;
  set<J extends A = A>(
    entity: J,
    id: string | number,
    data: CrudDto<E[J]["type"]>
  ): CrudData<E[J]["type"]> {
    this.data[entity] = this.data[entity] || {};
    this.data[entity][id] = this.prepForSave(data);
    return this.data[entity][id];
  }
  get<J extends A = A>(entity: J, id: string | number): CrudData<E[J]["type"]> {
    this.data[entity] = this.data[entity] || {};
    return this.data[entity][id];
  }

  startBatch(): void {
    return;
  }

  commitBatch(): void {
    return;
  }
}
