import path from "path";
import fs from "fs";
import console from "console";
import { SuperGraphConfig } from "@heaps/common";
import { BackfillOptions } from "../commands/backfill";
import { Abi } from "abitype";
import { Abi as AbiSchema } from "abitype/zod";
import { isEventType } from "@heaps/generators";
import { decodeEventLog, getAddress } from "viem";
import { RawEvent, SuperGraphEventType } from "@heaps/engine/src";

type AbiLookup = {
  [key: string]: Abi;
};

export function loadAbis(config: SuperGraphConfig): AbiLookup {
  return config.sources.reduce((acc, source) => {
    const rawAbi = JSON.parse(fs.readFileSync(source.abi, "utf-8"));
    const abi = AbiSchema.parse(rawAbi).filter(isEventType);
    return {
      ...acc,
      ...source.addresses.reduce((acc, address) => {
        return {
          ...acc,
          [address]: abi,
        };
      }, {}),
    };
  }, {});
}

export async function loadAndParseLogs(
  config: SuperGraphConfig,
  options: BackfillOptions
): Promise<SuperGraphEventType<any, any>[]> {
  const snapshotPath = path.join(options.pathToSnapshotDir, "events.json");
  const logs: RawEvent[] = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
  console.log(`Found ${logs.length} logs for ${config.name}...`);
  const abiLookup: AbiLookup = loadAbis(config);
  const events =
    logs
      .map((log) => {
        const address = getAddress(log.address);
        const abi = abiLookup[address];
        if (!abi) {
          console.log("No abi found for", log.address);
          return;
        }
        try {
          const logParams = decodeEventLog({
            abi,
            data: log.data,
            topics: [log.topics[0], ...log.topics.slice(1)],
          });
          return {
            event: logParams.eventName,
            backfill: true,
            params: {
              ...(logParams.args as any),
              sender: log.transaction.from,
              value: BigInt(log.transaction.value),
            },
            transaction: {
              hash: log.transactionHash,
              index: log.logIndex,
            },
            block: {
              number: BigInt(log.block.number || 0),
              timestamp: BigInt(log.block.timestamp),
            },
            log: {
              index: BigInt(log.logIndex || 0),
            },
          };
        } catch (e) {
          console.log(`Skipping log ${log.transactionHash} ${log.logIndex}`);
          return;
        }
      })
      .filter((log) => log) || [];
  return events as any as SuperGraphEventType<any, any>[];
}
