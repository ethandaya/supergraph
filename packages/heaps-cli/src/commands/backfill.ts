import { CAC } from "cac";
import { watch } from "chokidar";
import console from "console";
import { Source } from "@heaps/common";
import fs from "fs";
import path from "path";
import { loadConfig } from "../utils/load";
import { transposeFetcher } from "../fetcher/transpose";

type BackfillOptions = {
  watch: boolean;
  pathToSnapshotDir: string;
  pathToSetupScript: string;
  pathToFetcher: string;
  pathToConfig: string;
  mappingDir: string;
};

// async function setupStore(options: BackfillOptions) {
//   if (!options.pathToSetupScript) return;
//   const outputPath = await bundle(options.pathToSetupScript);
//   console.log(`Setup Script Bundled to ${outputPath}`);
//   const script = uncachedRequire(path.resolve(outputPath));
//   if (script.default && typeof script.default === "function") {
//     await script.default();
//   }
// }

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
  }
  const events = await transposeFetcher({
    contractAddress: source.addresses[0],
    startBlock: 0,
  });
  fs.mkdirSync(options.pathToSnapshotDir, { recursive: true });
  fs.writeFileSync(snapshotPath, JSON.stringify(events));
}

async function fetchSnapshots(options: BackfillOptions) {
  if (!options.pathToSnapshotDir) return;
  const config = loadConfig(options);
  await Promise.all(
    config.sources.map((source) => fetchSnapshotForSource(options, source))
  );
}

export async function backfill(options: BackfillOptions) {
  await fetchSnapshots(options);
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
