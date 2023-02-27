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
  createdAt: bigint;
  updatedAt: bigint;
};

export type CrudDto<T> = Omit<T, "id" | "updatedAt" | "createdAt">;

export interface SyncStore<
  E extends ModelLookup<string>,
  A extends keyof E = keyof E
> extends BaseStore<E, A> {
  type: StoreType;
  get<J extends A = A>(entity: A, id: string | number): CrudData<E[J]["type"]>;
  set<J extends A = A>(
    entity: J,
    id: string | number,
    data: CrudDto<E[J]["type"]>
  ): CrudData<E[J]["type"]>;

  startBatch(): void;
  commitBatch(): void;
}
export interface AsyncStore<
  E extends ModelLookup<string>,
  A extends keyof E = keyof E
> extends BaseStore<E, A> {
  type: StoreType;
  get<J extends A = A>(
    entity: A,
    id: string | number
  ): Promise<CrudData<E[J]["type"]>>;
  set<J extends A = A>(
    entity: J,
    id: string | number,
    data: CrudDto<E[J]["type"]>
  ): Promise<CrudData<E[J]["type"]>>;

  startBatch(): Promise<void>;
  commitBatch(): Promise<void>;
}

export type Store<E extends ModelLookup<string>, A extends keyof E = keyof E> =
  | SyncStore<E, A>
  | AsyncStore<E, A>;

export class BaseStore<
  E extends ModelLookup<string>,
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
