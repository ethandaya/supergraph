import { CAC } from "cac";
import console from "console";
import { Source, SuperGraphConfig, uncachedRequire } from "@heaps/common";
import fs from "fs";
import path from "path";
import { loadConfig } from "../utils/load";
import { transposeFetcher } from "../fetcher/transpose";
import { bundle } from "../utils/build";
import { Store } from "@heaps/engine";
import { LogData } from "../fetcher/common";
import { Abi as AbiSchema } from "abitype/zod";
import { Abi } from "abitype";
import { EventFragment, Interface, InterfaceAbi, keccak256 } from "ethers";
import { isEventType } from "@heaps/generators";
import { SuperGraphEventType } from "@heaps/engine/src";

type BackfillOptions = {
  watch: boolean;
  pathToSnapshotDir: string;
  pathToSetupScript: string;
  pathToStore: string;
  pathToConfig: string;
  mappingDir: string;
};

async function setupStore(options: BackfillOptions) {
  if (!options.pathToSetupScript) return;
  const outputPath = await bundle(options.pathToSetupScript);
  console.log(`Setup Script Bundled to ${outputPath}`);
  const script = uncachedRequire(path.resolve(outputPath));
  if (script.default && typeof script.default === "function") {
    await script.default();
  }
}

async function fetchSnapshotForSource(
  options: BackfillOptions,
  source: Source
) {
  const snapshotPath = path.join(
    options.pathToSnapshotDir,
    source.name + ".json"
  );
  if (!fs.existsSync(snapshotPath)) {
    console.log("No snapshot found, fetching a  new snapshot for", source.name);
    const events = await transposeFetcher({
      contractAddress: source.addresses[0],
      startBlock: 0,
    });
    fs.mkdirSync(options.pathToSnapshotDir, { recursive: true });
    fs.writeFileSync(snapshotPath, JSON.stringify(events));
  }
}

async function fetchSnapshots(
  config: SuperGraphConfig,
  options: BackfillOptions
) {
  if (!options.pathToSnapshotDir) return;
  await Promise.all(
    config.sources.map((source) => fetchSnapshotForSource(options, source))
  );
}

function getTopic0Hash(eventInterface: string): string {
  const hash = keccak256(Buffer.from(eventInterface, "utf-8"));
  return hash.toString();
}

async function seedStore(config: SuperGraphConfig, options: BackfillOptions) {
  if (!options.pathToStore) {
    throw new Error("No path to store provided");
  }
  const outputPath = await bundle(options.pathToStore);
  const storeModule = uncachedRequire(path.resolve(outputPath));
  if (storeModule.store && typeof storeModule.store === "object") {
    const { store }: { store: Store<any, any> } = storeModule;
    await Promise.all(
      config.sources.map(async (source) => {
        const snapshotPath = path.join(
          options.pathToSnapshotDir,
          source.name + ".json"
        );
        const handlerOutput = await bundle(source.mapping);
        const handlerModule = uncachedRequire(path.resolve(handlerOutput));
        const logs: LogData[] = JSON.parse(
          fs.readFileSync(snapshotPath, "utf-8")
        );
        console.log("Seeding", source.name, "with", logs.length, "events");
        let abi: Abi = JSON.parse(fs.readFileSync(source.abi, "utf-8"));
        try {
          abi = AbiSchema.parse(abi);
        } catch (e) {
          console.log("Error parsing ABI", e);
          throw e;
        }
        const contractEvents = abi
          .filter(isEventType)
          .filter((event) =>
            source.events.map((e) => e.name).includes(event.name)
          );
        const hashes = contractEvents.map(
          (event) => EventFragment.from(event).topicHash
        );
        const matchingLogs = logs.filter((log) =>
          hashes.includes(log.topics[0])
        );
        console.log("matching events: ", matchingLogs.length);
        const iface = new Interface(abi as InterfaceAbi);
        const events = matchingLogs.map((log) => {
          const logDescription = iface.parseLog(log);
          if (!logDescription) {
            console.log("No log description found for", log);
            return;
          }
          return {
            event: logDescription.name,
            backfill: true,
            params: logDescription.fragment.inputs.reduce(
              (acc, input, idx) => ({
                ...acc,
                [input.name]: logDescription.args[idx],
              }),
              {
                sender: log.sender,
                value: BigInt(log.value),
              }
            ),
            transaction: {
              hash: log.txHash,
              index: BigInt(log.logIndex),
            },
            block: {
              number: BigInt(log.blockNumber),
              timestamp: BigInt(log.blockTimestamp),
            },
          };
        }) as SuperGraphEventType<any, any>[];
        await store.startBatch();
        try {
          for (const event of events.slice(0, 1)) {
            console.log("event", event);
            const handler = handlerModule[`handle${event.event}`];
            if (handler) {
              await handler(event);
            } else {
              console.log("No handler found for", event.event);
            }
          }
          await store.commitBatch();
          console.log("Seeding complete for", source.name);
        } catch (e) {
          console.log("Error while seeding", e);
        } finally {
          await store.close();
        }
      })
    );
  }
}

export async function backfill(options: BackfillOptions) {
  const config = loadConfig(options);
  await fetchSnapshots(config, options);
  await setupStore(options);
  await seedStore(config, options);
  // if (options.watch) {
  //   console.log("Watching for Changes...");
  //   watch(options.mappingDir).on("change", async () => {
  //     console.log("Change detected, regenerating...");
  //     try {
  //       console.log("backfill");
  //     } catch (e) {
  //       console.error("Error while regenerating");
  //       console.error(e);
  //     }
  //   });
  // }
}

export function registerBackfillCommands(cli: CAC) {
  cli
    .command("backfill")
    .option("--watch", "Watch mode")
    .option("--pathToStore <path>", "Path to store", {
      default: "./store.ts",
    })
    .option("--pathToSnapshotDir <path>", "Path to snapshot", {
      default: "./snapshots",
    })
    .option("--pathToSetupScript <path>", "Path to setup script", {
      default: "./store.setup.ts",
    })
    .option("--pathToConfig <path>", "Path to config", {
      default: "./supergraph.json",
    })
    .option("--mappingDir <path>", "Path to mapping directory", {
      default: "./src",
    })
    .action(backfill);
  return cli;
}
