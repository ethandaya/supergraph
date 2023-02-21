import { FetcherOptions } from "../cron";
import { SuperGraphEventType } from "@heaps/engine";
import { Abi, ExtractAbiEvents } from "abitype";
import { isEventType } from "../common";
import { makeEventDecoder } from "@heaps/engine/src";

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

// TODO - strictly type query
function transposeResultToEvent<TAbi extends Abi>(
  events: ExtractAbiEvents<TAbi>[],
  row: any
): SuperGraphEventType<string, any> {
  const decoder = makeEventDecoder(events);
  const { event, data } = decoder({
    data: row.data,
    topics: [row.topic_0, row.topic_1, row.topic_2, row.topic_3],
  });
  const params = {
    sender: row.from_address,
    value: BigInt(row.value),
    ...data,
  };
  return {
    event,
    block: {
      number: BigInt(row.block_number),
      timestamp: BigInt(Math.floor(new Date(row.timestamp).getTime() / 1000)),
    },
    params,
    transaction: {
      hash: row.transaction_hash,
      index: row.transaction_position,
    },
  };
}

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
  const events = options.abi.filter(isEventType);
  return output.results.map((row: any) => transposeResultToEvent(events, row));
}
