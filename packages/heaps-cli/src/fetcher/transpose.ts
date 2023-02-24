import fetch from "cross-fetch";

type FetcherOptions = {
  contractAddress: string;
  startBlock?: number;
  endBlock?: number;
};

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
  return output.results;
}
