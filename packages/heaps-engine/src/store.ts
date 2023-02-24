import { StoreType } from "./entity";
import { z } from "zod";

export type ModelLookup<T extends string> = {
  [key in T]: {
    type: z.infer<z.AnyZodObject>;
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

export type CrudDto<T> = Omit<T, "id" | "updatedAt" | "createdAt">;

export interface SyncStore<
  H extends string,
  E extends ModelLookup<H>,
  A extends keyof E = keyof E
> extends BaseStore<H, E, A> {
  type: StoreType;
  get(entity: H, id: string | number): CrudData<E[A]["type"]>;
  set(
    entity: H,
    id: string | number,
    data: CrudDto<E[A]["type"]>
  ): CrudData<E[A]["type"]>;

  startBatch(): void;
  commitBatch(): void;
}
export interface AsyncStore<
  H extends string,
  E extends ModelLookup<H>,
  A extends keyof E = keyof E
> extends BaseStore<H, E, A> {
  type: StoreType;
  get(entity: H, id: string | number): Promise<CrudData<E[A]["type"]>>;
  set(
    entity: H,
    id: string | number,
    data: CrudDto<E[A]["type"]>
  ): Promise<CrudData<E[A]["type"]>>;

  startBatch(): Promise<void>;
  commitBatch(): Promise<void>;
}

export type Store<
  H extends string,
  E extends ModelLookup<H>,
  A extends keyof E = keyof E
> = SyncStore<H, E, A> | AsyncStore<H, E, A>;

export class BaseStore<
  H extends string,
  E extends ModelLookup<H>,
  A extends keyof E = keyof E
> {
  protected prepForSave(data: CrudDto<E[A]["type"]>): CrudData<E[A]["type"]> {
    const now = BigInt(Date.now());
    const _data = data as CrudData<E[A]["type"]>;
    if (_data.createdAt) {
      _data.updatedAt = now;
    } else {
      _data.createdAt = now;
      _data.updatedAt = now;
    }
    return _data;
  }

  close() {
    throw new Error("Method not implemented.");
  }
}
