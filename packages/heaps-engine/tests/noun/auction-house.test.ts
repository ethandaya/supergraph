import {handleAuctionCreated} from "../../src/mapping/nouns-auction-house";
import {store} from "../../src/mapping/types/schema";

function range(start: number, end: number) {
  return [...Array(end - start + 1)].map((_, idx) => idx);
}

const migrations = [
  `DROP TABLE IF EXISTS auction`,
  `DROP TABLE IF EXISTS noun`,
  `DROP TABLE IF EXISTS account`,
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
  const EVENT_COUNT = 1000;
  const events = range(0, 1000 - 1).map((idx) => ({
    params: {
      nounId: idx.toString(),
      startTime: "0",
      endTime: "0",
    },
    transaction: {
      hash: {
        toHex: () => "0x0",
      },
    },
  }));

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

  it("should handle transactional set for 10000 entities", async () => {
    const insertNouns = store.db.transaction((events) => {
      for (const event of events) {
        store.set("noun", event.params.nounId.toString(), {
          id: event.params.nounId.toString(),
          seed: event.params.nounId.toString(),
          owner: "0x0000000000000000000000000000000000000000",
          createdAt: 0,
          updatedAt: 0,
        });
      }
    });
    insertNouns(events);

    const nounCount = store.db.prepare("SELECT COUNT('id') FROM noun").get();
    expect(nounCount["COUNT('id')"]).toEqual(EVENT_COUNT);
  });

  it("should handle transactional handler run for 100000 events", () => {
    const insertNouns = store.db.transaction((events) => {
      for (const event of events) {
        store.set("noun", event.params.nounId.toString(), {
          id: event.params.nounId.toString(),
          seed: event.params.nounId.toString(),
          owner: "0x0000000000000000000000000000000000000000",
          createdAt: 0,
          updatedAt: 0,
        });
      }
    });
    insertNouns(events);

    const insertAuctions = store.db.transaction((events) => {
      for (const event of events) {
        handleAuctionCreated(event);
      }
    });
    insertAuctions(events);

    const auctionCount = store.db
      .prepare("SELECT COUNT('id') FROM auction")
      .get();
    expect(auctionCount["COUNT('id')"]).toEqual(EVENT_COUNT);
  });
});
