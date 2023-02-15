import { StoreType } from "./entity";
import { ModelLookup } from "../../tests/store/sqlite";

export type CrudData<T> = T & {
  createdAt?: bigint;
  updatedAt?: bigint;
};
export interface SyncStore<
  H extends string,
  E extends ModelLookup<H>,
  A extends keyof E = keyof E
> {
  type: StoreType;
  get(entity: A, id: string | number): CrudData<E[A]> | null;
  set(entity: A, id: string | number, data: E[A]): CrudData<E[A]>;
}
export interface AsyncStore {
  type: StoreType;
  set<T extends {}>(
    table: string,
    id: string | number,
    dto: T
  ): Promise<CrudData<T>>;
}

export type Store<
  H extends string,
  E extends ModelLookup<H>,
  A extends keyof E = keyof E
> = SyncStore<H, E, A> | AsyncStore;
