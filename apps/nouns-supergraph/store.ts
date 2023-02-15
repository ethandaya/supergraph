import { AccountSchema, AuctionSchema, BidSchema, NounSchema } from "./models";
import { PostgresStore } from "@heaps/engine";
import { SchemaNames } from "./src/types/schema";

const { POSTGRES_URL } = process.env;
if (!POSTGRES_URL) throw new Error("Missing POSTGRES_URL env var");

export const store = new PostgresStore<SchemaNames>(POSTGRES_URL, {
  account: AccountSchema,
  auction: AuctionSchema,
  bid: BidSchema,
  noun: NounSchema,
});
