import { handleAuctionCreated } from "../src/nouns-auction-house";
import { AuctionCreated } from "../src/types/NounsAuctionHouse/NounsAuctionHouse";
import { store } from "../src/types/schema";

const migrations = [
  `DROP TABLE IF EXISTS auction`,
  `DROP TABLE IF EXISTS noun`,
  `DROP TABLE IF EXISTS account`,
  `CREATE TABLE IF NOT EXISTS auction
   (
       id        TEXT PRIMARY KEY,
       noun      TEXT,
       amount    INTEGER,
       startTime INTEGER,
       endTime   INTEGER,
       settled   BOOLEAN,
       bidder    TEXT DEFAULT NULL,
       createdAt INTEGER,
       updatedAt INTEGER
   )`,
  `CREATE TABLE IF NOT EXISTS noun
   (
       id        TEXT PRIMARY KEY,
       seed      TEXT, 
       owner     TEXT,
       createdAt INTEGER,
       updatedAt INTEGER
   )`,
  `CREATE TABLE IF NOT EXISTS account
   (
       id                 TEXT PRIMARY KEY,
       delegate           TEXT,
       tokenBalanceRaw    TEXT,
       tokenBalance       TEXT,
       totalTokensHeldRaw TEXT,
       totalTokensHeld    TEXT
   )`,
];

describe("Auction House", () => {
  beforeEach(() => {
    migrations.forEach((migration) => store.db.exec(migration));
  });

  it("should handle new auction created", () => {
    store.set("noun", "0", {
      id: "0",
      seed: "0",
      owner: "0x0000000000000000000000000000000000000000",
      createdAt: 0,
      updatedAt: 0,
    });
    const event: AuctionCreated = {
      params: {
        nounId: 0n,
        startTime: 9223372036854775807n,
        endTime: 0n,
        sender: "0x000000",
        value: 0n,
      },
      transaction: {
        hash: "0x0",
        index: 0n,
      },
      block: {
        number: 0n,
        timestamp: 0n,
      },
    };
    handleAuctionCreated(event);
    const res = store.get("auction", "0");
    expect(res).toEqual({
      id: "0",
      noun: "0",
      amount: 0n,
      startTime: 9223372036854775807n,
      endTime: 0n,
      bidder: null,
      settled: false,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
  });
});
