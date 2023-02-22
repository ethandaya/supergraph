import { CAC } from "cac";
import { watch } from "chokidar";
import console from "console";
import { bundle } from "../utils/build";
import { Source, uncachedRequire } from "@heaps/common";
import fs from "fs";
import path from "path";
import { loadConfig } from "../utils/load";
import { FetcherOptions } from "@heaps/server/src";

type BackfillOptions = {
  watch: boolean;
  pathToSnapshotDir: string;
  pathToSetupScript: string;
  pathToFetcher: string;
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
    console.log("No snapshot found, fetching a new snapshot for", source.name);
    const abi = JSON.parse(fs.readFileSync(source.abi, "utf-8"));
    const outputPath = await bundle(options.pathToFetcher);
    console.log(`Fetcher Script Bundled to ${outputPath}`);
    const fetcher = uncachedRequire(path.resolve(outputPath));
    if (fetcher.default && typeof fetcher.default === "function") {
      const opts: FetcherOptions = {
        startBlock: 0,
        abi,
        contractAddress: source.addresses[0],
        decode: false,
      };
      const snapshot = await fetcher.default(opts);
      fs.mkdirSync(options.pathToSnapshotDir, { recursive: true });
      fs.writeFileSync(snapshotPath, JSON.stringify(snapshot));
    }
  }
}

async function fetchSnapshots(options: BackfillOptions) {
  if (!options.pathToSnapshotDir) return;
  const config = loadConfig(options);
  for (const idx in config.sources) {
    const source = config.sources[idx];
    await fetchSnapshotForSource(options, source);
  }
  // return uncachedRequire(options.pathToSnapshotDir);
}

export async function backfill(options: BackfillOptions) {
  await fetchSnapshots(options);
  await setupStore(options);
  if (options.watch) {
    console.log("Watching for Changes...");
    watch(options.mappingDir).on("change", async () => {
      console.log("Change detected, regenerating...");
      try {
        console.log("backfill");
      } catch (e) {
        console.error("Error while regenerating");
        console.error(e);
      }
    });
  }
}

export function registerBackfillCommands(cli: CAC) {
  cli
    .command("backfill")
    .option("--watch", "Watch mode")
    .option("--pathToFetcher <path>", "Path to fetcher", {
      default: "./fetcher.ts",
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
