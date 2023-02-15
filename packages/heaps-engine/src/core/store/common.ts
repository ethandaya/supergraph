import { z } from "zod";

export type ModelLookup<T extends string> = {
  [key in T]: z.AnyZodObject;
};

export type StatementLookup<T extends string, K> = {
  [key in T]: {
    upsert: K;
    select: K;
  };
};

export type StoreType = "sync" | "async";

export type StoreMeta = {
  type: StoreType;
  name: string;
  description: string;
};
