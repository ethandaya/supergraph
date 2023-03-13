import path from "path";
import fs from "fs";
import console from "console";
import { SuperGraphConfig } from "@heaps/common";
import { BackfillOptions } from "../commands/backfill";
import { Abi } from "abitype";
import { Abi as AbiSchema } from "abitype/zod";
import { isEventType } from "@heaps/generators";
import { decodeEventLog, getAddress, Log, Hex } from "viem";

export async function fetchSnapshotForSource(
  config: SuperGraphConfig,
  options: BackfillOptions
) {
  const snapshotPath = path.join(
    options.pathToSnapshotDir,
    config.name + ".json"
  );
  if (!fs.existsSync(snapshotPath)) {
    console.log("No snapshot found, fetching a  new snapshot for", config.name);
    // TODO fetch snapshot from heaps
    // const contractAddresses = config.sources.map((s) => s.addresses).flat();
    // const events = await transposeFetcher({
    //   contractAddresses,
    //   startBlock: 0,
    // });
    fs.mkdirSync(options.pathToSnapshotDir, { recursive: true });
    fs.writeFileSync(snapshotPath, JSON.stringify([]));
  }
}

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

type EventLog = Log & {
  topics: [signature: Hex, ...args: Hex[]];
};

export async function loadAndParseLogs(
  config: SuperGraphConfig,
  options: BackfillOptions
) {
  const snapshotPath = path.join(
    options.pathToSnapshotDir,
    config.name + ".json"
  );
  const logs: EventLog[] = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
  console.log(`Found ${logs.length} logs for ${config.name}...`);
  const abiLookup: AbiLookup = loadAbis(config);
  return logs
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
          topics: log.topics,
        });
        return {
          event: logParams.eventName,
          backfill: true,
          params: {
            ...(logParams.args as any),
            sender: "0x0",
            value: 1n,
          },
          transaction: {
            hash: log.transactionHash,
            index: log.logIndex,
          },
          block: {
            number: log.blockNumber,
            timestamp: Date.now(),
          },
        };
      } catch (e) {
        console.log(`Skipping log ${log.transactionHash} ${log.logIndex}`);
        return;
      }
    })
    .filter((log) => log);
}
//
// export async function loadEvents(options: BackfillOptions, source: Source) {
//   const snapshotPath = path.join(
//     options.pathToSnapshotDir,
//     source.name + ".json"
//   );
//   const logs: LogData[] = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
//   let abi: Abi = JSON.parse(fs.readFileSync(source.abi, "utf-8"));
//   try {
//     abi = AbiSchema.parse(abi);
//   } catch (e) {
//     console.log("Error parsing ABI", e);
//     throw e;
//   }
//
//   const contractEvents = abi
//     .filter(isEventType)
//     .filter((event) => source.events.map((e) => e.name).includes(event.name));
//   const hashes = contractEvents.map(
//     (event) => EventFragment.from(event).topicHash
//   );
//   const matchingLogs = logs.filter((log) => hashes.includes(log.topics[0]));
//   const iface = new Interface(abi as InterfaceAbi);
//   return matchingLogs.map((log) => {
//     const logDescription = iface.parseLog(log);
//     if (!logDescription) {
//       console.log("No log description found for", log);
//       return;
//     }
//     return {
//       event: logDescription.name,
//       backfill: true,
//       params: logDescription.fragment.inputs.reduce(
//         (acc, input, idx) => ({
//           ...acc,
//           [input.name]: logDescription.args[idx],
//         }),
//         {
//           sender: log.sender,
//           value: BigInt(log.value),
//         }
//       ),
//       transaction: {
//         hash: log.txHash,
//         index: BigInt(log.logIndex),
//       },
//       block: {
//         number: BigInt(log.blockNumber),
//         timestamp: BigInt(log.blockTimestamp),
//       },
//     };
//   }) as SuperGraphEventType<any, any>[];
// }
