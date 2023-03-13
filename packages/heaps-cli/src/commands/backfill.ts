import { CAC } from "cac";
import { SuperGraphConfig } from "@heaps/common";
import { loadConfig } from "../utils/load";
import { loadAndParseLogs } from "../services/backfill";
import { uncachedRequire } from "@heaps/common/src";
import { bundle } from "../utils/build";
import path from "path";
import esbuild from "esbuild";

export type BackfillOptions = {
  target: string;
  entryPoint: string;
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

// async function fetchSnapshots(
//   config: SuperGraphConfig,
//   options: BackfillOptions
// ) {
//   if (!options.pathToSnapshotDir) return;
//   await fetchSnapshotForSource(config, options);
// }
//
function bundleEntry(entryPoint: string) {
  return esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    outdir: "./.heaps",
    platform: "node",
    external: ["zod", "@heaps/engine", "@heaps/common", "@heaps/server"],
    target: ["esnext"],
    resolveExtensions: [".ts"],
    minify: false,
  });
}

async function seedStore(config: SuperGraphConfig, options: BackfillOptions) {
  await bundleEntry(options.entryPoint);
  const events = await loadAndParseLogs(config, options);
  console.log(`Loaded ${events.length} events`);
  const modules = uncachedRequire(path.resolve("./.heaps/index.js"));
  await events.reduce(async (acc, event) => {
    await acc;
    if (!event?.event) {
      console.log("Skipping event", event);
      return;
    }
    const handler = modules[`handle${event.event}`];
    if (handler) {
      await handler(event);
    }
  }, Promise.resolve());
  await modules.store.sql.end();
}

export async function backfill(options: BackfillOptions) {
  const config = loadConfig(options);
  // TODO - add log fetcher
  // await fetchSnapshots(config, options);
  await setupStore(options);
  await seedStore(config, options);

  // if (options.target) {
  //   const source = config.sources.find((s) => s.name === options.target);
  //   if (!source) throw new Error(`Source ${options.target} not found`);
  //   await seedStore(source, options);
  // } else {
  //   await Promise.all(
  //     config.sources.map((source) => seedStore(source, options))
  //   );
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
    .option("--entryPoint <path>", "Path to entry", {
      default: "./lib/index.ts",
    })
    .option("target <string>", "Target to backfill")
    .action(backfill);
  return cli;
}
