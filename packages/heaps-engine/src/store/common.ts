import { StoreType } from "../entity";
import { ModelLookup } from "../store";

export type StatementLookup<H extends string, E extends ModelLookup<H>, K> = {
  [key in keyof E]: {
    upsert: K;
    select: K;
  };
};

export type ModelSchemaLookup<H extends string, E extends ModelLookup<H>> = {
  [key in keyof E]: E[key]["schema"];
};

export type StoreMeta = {
  type: StoreType;
  name: string;
  description: string;
};
