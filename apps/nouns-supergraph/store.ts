import { EntityNames, ModelLookupType, models } from "./src/types/models";
import { PostgresStore } from "@heaps/engine/src";

export const store = new PostgresStore<EntityNames, ModelLookupType>(models);
