import { SQLiteStore } from "../core/store";
import { NounSchema } from "./models";

type Models = "noun";
export const store = new SQLiteStore<Models>("", {
  noun: NounSchema,
});
