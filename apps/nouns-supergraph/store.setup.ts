import { store } from "./store";

async function run() {
  console.log("Running setup script...");
  await store.sql.begin((sql) => [
    sql`DROP TABLE IF EXISTS auction`,
    sql`DROP TABLE IF EXISTS noun`,
    sql`DROP TABLE IF EXISTS account`,
    sql`DROP TABLE IF EXISTS bid`,
    // TODO - add bids
    sql`CREATE TABLE IF NOT EXISTS auction
        (
          id         VARCHAR(255) PRIMARY KEY,
          noun       VARCHAR(255),
          amount     DECIMAL(78, 0),
          start_time BIGINT,
          end_time   BIGINT,
          bidder     VARCHAR(42) DEFAULT NULL,
          settled    BOOLEAN,
          created_at BIGINT,
          updated_at BIGINT
        )`,
    // TODO - add votes
    sql`CREATE TABLE IF NOT EXISTS noun
        (
          id         VARCHAR(255) PRIMARY KEY,
          seed       TEXT,
          owner      VARCHAR(42),
          created_at BIGINT,
          updated_at BIGINT
        )`,
    // TODO - add nouns
    sql`CREATE TABLE IF NOT EXISTS account
        (
            id                    VARCHAR(255) PRIMARY KEY,
            delegate              VARCHAR(255),
            token_balance_raw     DECIMAL(78, 0),
            token_balance         DECIMAL(78, 0),
            total_tokens_held_raw DECIMAL(78, 0),
            total_tokens_held     DECIMAL(78, 0),
            created_at            BIGINT,
            updated_at            BIGINT
        )`,
    sql`CREATE TABLE IF NOT EXISTS bid
        (
          id              TEXT PRIMARY KEY,
          noun            VARCHAR(255),
          amount          DECIMAL(78, 0),
          bidder          VARCHAR(42),
          auction         VARCHAR(255),
          tx_index        BIGINT,
          block_number    BIGINT,
          block_timestamp BIGINT,
          created_at      BIGINT,
          updated_at      BIGINT
        )
    `,
  ]);
  await store.sql.end();
}

export default run;
