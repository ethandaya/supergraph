import { AsyncStore, BaseStore, CrudDto, SyncStore } from "../../src/store";
import { StoreType } from "../../src/entity";
import { ModelLookup } from "../../src";
import { z } from "zod";

export class AsyncTestStore<
    H extends string,
    E extends ModelLookup<H> = ModelLookup<H>,
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
    data: CrudDto<z.infer<E[A]>>
  ): Promise<z.infer<E[A]>> {
    this.data[entity] = this.data[entity] || {};
    this.data[entity][id] = this.prepForSave(data);
    return Promise.resolve(this.data[entity][id]);
  }
  get(entity: A, id: string | number): Promise<z.infer<E[A]>> {
    this.data[entity] = this.data[entity] || {};
    return Promise.resolve(this.data[entity][id]);
  }
}

export class TestStore<
    H extends string,
    E extends ModelLookup<H> = ModelLookup<H>,
    A extends keyof E = keyof E
  >
  extends BaseStore<E, A>
  implements SyncStore<E, A>
{
  type: StoreType = StoreType.SYNC;
  data: any;
  set<J extends A = A>(
    entity: J,
    id: string,
    data: CrudDto<z.infer<E[J]>>
  ): z.infer<E[J]> {
    const model: E[J] = this.models[entity];
    const dto: z.infer<E[J]> = model.parse(
      this.prepForSave({
        id,
        ...data,
      })
    );
    this.data[entity] = this.data[entity] || {};
    this.data[entity][id] = dto;
    return dto;
  }
  get<J extends A = A>(entity: J, id: string): z.infer<E[J]> {
    this.data[entity] = this.data[entity] || {};
    return this.data[entity][id];
  }
}
