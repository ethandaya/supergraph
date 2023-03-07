import { StoreType } from "../entity";
import { z } from "zod";

export type ModelLookup<T extends string> = {
  [k in T]: z.AnyZodObject;
};

export type StatementLookup<H extends string, E extends ModelLookup<H>, K> = {
  [key in keyof E]: {
    upsert: K;
    select: K;
  };
};

export type StoreMeta = {
  type: StoreType;
  name: string;
  description: string;
};
