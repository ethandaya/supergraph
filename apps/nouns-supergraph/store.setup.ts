import { store } from "./src/types/schema";

const migrations = [
    `DROP TABLE IF EXISTS auction`,
    `DROP TABLE IF EXISTS noun`,
    `DROP TABLE IF EXISTS account`,
    `DROP TABLE IF EXISTS bid`,
    `CREATE TABLE IF NOT EXISTS auction
   (
       id        TEXT PRIMARY KEY,
       noun      TEXT,
       amount    TEXT,
       startTime BIGINT,
       endTime   BIGINT,
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
       totalTokensHeld    TEXT,
       createdAt INTEGER,
       updatedAt INTEGER
   )`,
    `
    CREATE TABLE IF NOT EXISTS bid
    (
      id             TEXT PRIMARY KEY,
      noun           TEXT,
      amount         TEXT,
      bidder         TEXT,
      auction        TEXT,
      txIndex        INTEGER,
      blockNumber    INTEGER,
      blockTimestamp INTEGER,
      createdAt      INTEGER,
      updatedAt      INTEGER
    )
  `,
];
function setup() {
    migrations.forEach((migration) => {
        store.db.exec(migration);
    });
}

export default setup;
