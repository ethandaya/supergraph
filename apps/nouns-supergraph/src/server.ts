import { client } from "./client";
import { RPCFetcher } from "@heaps/engine";
import * as process from "process";
import { mainnet } from "viem/chains";

async function cron(startBlock: bigint) {
  const currentBlock = await client.getBlockNumber();
  const RPC_URL = process.env.RPC_URL;
  if (!RPC_URL) throw new Error("RPC_URL not set");
  const fetcher = new RPCFetcher([], RPC_URL, mainnet, 10000n);
  const logs = await fetcher.fetchLogsForRange(
    currentBlock - 10n,
    currentBlock
  );
  console.log(`Fetched ${logs.length} logs`);
}

cron(0n).catch((e) => console.error("Error: ", e));
