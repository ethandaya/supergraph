import { StoreType } from "./entity";
import { z } from "zod";
import { ModelLookup } from "./store/common";

export type CrudData<T> = T & {
  createdAt: bigint;
  updatedAt: bigint;
};

export interface SyncStore<
  E extends ModelLookup<string>,
  A extends keyof E = keyof E
> extends BaseStore<E, A> {
  type: StoreType;
  get<J extends A = A>(entity: A, id: string): z.infer<E[J]> | null;
  set<J extends A = A>(
    entity: J,
    id: string,
    data: CrudDto<z.infer<E[J]>>
  ): z.infer<E[J]>;
}

export interface AsyncStore<
  E extends ModelLookup<string>,
  A extends keyof E = keyof E
> extends BaseStore<E, A> {
  type: StoreType;
  get<J extends A = A>(entity: A, id: string): Promise<z.infer<E[J]> | null>;
  set<J extends A = A>(
    entity: J,
    id: string,
    data: CrudDto<z.infer<E[J]>>
  ): Promise<z.infer<E[J]>>;
}

export type Store<E extends ModelLookup<string>, A extends keyof E = keyof E> =
  | SyncStore<E, A>
  | AsyncStore<E, A>;

export type CrudDto<T> = Omit<CrudData<T>, "id" | "createdAt" | "updatedAt">;

export class BaseStore<
  E extends ModelLookup<string>,
  A extends keyof E = keyof E
> {
  constructor(public readonly models: E) {}

  protected prepForSave<T extends A>(
    data: CrudDto<z.infer<E[T]>>
  ): z.infer<CrudData<E[T]>> {
    const now = BigInt(Date.now());
    return {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };
  }

  serialize<J extends A = A>(entity: J, dto: z.infer<E[J]>, update = false) {
    const model: E[J] = this.models[entity];
    const arrayTypes = Object.keys(model.shape).filter(
      (key) => model.shape[key] instanceof z.ZodArray
    );
    const bigIntTypes = Object.keys(model.shape).filter(
      (key) => model.shape[key] instanceof z.ZodBigInt
    );
    const dbModel = model.extend({
      ...arrayTypes.reduce((acc, key) => {
        return {
          ...acc,
          [key]: z.coerce.string().array(),
        };
      }, {}),
      ...bigIntTypes.reduce((acc, key) => {
        return {
          ...acc,
          [key]: z.coerce.string(),
        };
      }, {}),
    });
    return update
      ? dbModel
          .omit({
            id: true,
          })
          .parse(dto)
      : dbModel.parse(dto);
  }

  close() {
    throw new Error("Method not implemented.");
  }
}
