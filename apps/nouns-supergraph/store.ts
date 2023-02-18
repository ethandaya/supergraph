import { SqliteStore } from "@heaps/engine";
import { models, ModelLookupType, EntityNames } from "./src/types/models";

export const store = new SqliteStore<EntityNames, ModelLookupType>(models);
