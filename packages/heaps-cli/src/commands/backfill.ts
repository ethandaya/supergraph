import { CAC } from "cac";
import console from "console";
import { Source, uncachedRequire, SuperGraphConfig } from "@heaps/common";
import fs from "fs";
import path from "path";
import { loadConfig } from "../utils/load";
import { transposeFetcher } from "../fetcher/transpose";
import { bundle } from "../utils/build";
import { Store } from "@heaps/engine";

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
        const events = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
        console.log("Seeding", source.name, "with", events.length, "events");
        await store.startBatch();
        for (const event of events.slice(0, 10)) {
          // await handlerModule[](event, handlerModule);
          const handler = handlerModule[event.event];
          if (handler) {
            console.log("Seeded", source.name, "with", event);
          } else {
            console.log("No handler found for", event.event);
          }
        }
        await store.commitBatch();
        console.log("Seeding complete for", source.name);
        await store.close();
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
