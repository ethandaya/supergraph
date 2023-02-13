import { SQLiteStore } from "@heaps/engine";
import { AccountSchema, AuctionSchema, BidSchema, NounSchema } from "./models";

export const store = new SQLiteStore({
  account: AccountSchema,
  auction: AuctionSchema,
  bid: BidSchema,
  noun: NounSchema,
});
