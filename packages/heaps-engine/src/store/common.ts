import { StoreType } from "../entity";

export type StatementLookup<T extends string, K> = {
  [key in T]: {
    upsert: K;
    select: K;
  };
};

export type StoreMeta = {
  type: StoreType;
  name: string;
  description: string;
};
