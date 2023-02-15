import { StoreType } from "./entity";
import { z } from "zod";

export type ModelLookup<T extends string> = {
  [key in T]: {
    type: CrudData<z.infer<z.AnyZodObject>>;
    schema: z.AnyZodObject;
  };
};

export type SchemaLookup<T extends string, K extends ModelLookup<T>> = {
  [key in T]: K[key]["schema"];
};

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
  get(entity: H, id: string | number): CrudData<E[A]["type"]> | null;
  set(
    entity: H,
    id: string | number,
    data: E[A]["type"]
  ): CrudData<E[A]["type"]>;
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
