import { handleAuctionCreated } from "../../src/mapping/nouns-auction-house";
import { store } from "../../src/mapping/types/schema";

const migrations = [
  `CREATE TABLE IF NOT EXISTS auction
   (
       id        TEXT PRIMARY KEY,
       noun      TEXT,
       amount    TEXT,
       startTime TEXT,
       endTime   TEXT,
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
  beforeAll(() => {
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
    const event = {
      params: {
        nounId: "0",
        startTime: "0",
        endTime: "0",
      },
      transaction: {
        hash: {
          toHex: () => "0x0",
        },
      },
    };
    handleAuctionCreated(event);
    const res = store.get("auction", "0");
    expect(res).toEqual({
      id: "0",
      noun: "0",
      amount: "0",
      startTime: "0",
      endTime: "0",
      bidder: null,
      settled: false,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
  });
});
