import fetch from "cross-fetch";
import { hexToInt, hexToString, LogData } from "./common";

type FetcherOptions = {
  contractAddress: string;
  startBlock?: number;
  endBlock?: number;
};

function mapRowToLog(row: any): LogData {
  const txHash = row["transaction_hash"];
  const blockNumber = hexToInt(row["block_number"]);
  const blockHash = row["block_hash"];
  const blockTimestamp = new Date(row["timestamp"]).getTime() / 1000;
  const logIndex = hexToInt(row["log_index"]);
  const contractAddress = row["contract_address"];
  const topics = [
    row["topic_0"],
    row["topic_1"],
    row["topic_2"],
    row["topic_3"],
  ].filter(Boolean);
  const data = row["data"];
  const value = hexToString(row["value"]);
  const sender = row["from_address"];
  const recipient = row["to_address"];

  return {
    txHash,
    blockNumber,
    blockHash,
    blockTimestamp,
    logIndex,
    contractAddress,
    topics,
    data,
    value,
    sender,
    recipient,
  };
}

const queryData = (options: FetcherOptions) =>
  JSON.stringify({
    sql: `
        SELECT l.*, t.*
        FROM ethereum.logs l
        INNER JOIN ethereum.transactions t
        ON l.transaction_hash = t.transaction_hash
        WHERE l.address = '${options.contractAddress}'
        AND l.block_number >= ${options.startBlock};
    `,
  });

export async function transposeFetcher(options: FetcherOptions) {
  if (!process.env.TRANSPOSE_API_KEY) {
    throw new Error("Missing TRANSPOSE_API_KEY env var");
  }

  console.log(`Fetching events from block ${options.startBlock}...`);
  const body = queryData(options);
  const res = await fetch(`https://api.transpose.io/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": body.length.toString(),
      "X-API-KEY": process.env.TRANSPOSE_API_KEY,
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.statusText}`);
  }
  console.log("Credits charged:", res.headers.get("x-credits-charged"));
  const output = await res.json();
  console.log(`Fetched ${output.stats.count} events`);
  return output.results.map(mapRowToLog);
}
