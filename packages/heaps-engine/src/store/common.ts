import { StoreType } from "../entity";
import { z } from "zod";

export type ModelLookup<T extends string> = {
  [k in T]: z.AnyZodObject;
};

export type StoreMeta = {
  type: StoreType;
  name: string;
  description: string;
};
