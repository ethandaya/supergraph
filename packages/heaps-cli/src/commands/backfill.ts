import { CAC } from "cac";
import console from "console";
import { SuperGraphConfig, uncachedRequire } from "@heaps/common";
import path from "path";
import { loadConfig } from "../utils/load";
import { bundle } from "../utils/build";
import { fetchSnapshotForSource, loadEvents } from "../services/backfill";
import * as esbuild from "esbuild";
import { Source } from "@heaps/common/src";

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

async function fetchSnapshots(
  config: SuperGraphConfig,
  options: BackfillOptions
) {
  if (!options.pathToSnapshotDir) return;
  await Promise.all(
    config.sources.map((source) => fetchSnapshotForSource(options, source))
  );
}

async function seedStore(source: Source, options: BackfillOptions) {
  await esbuild.build({
    entryPoints: [options.entryPoint],
    bundle: true,
    outdir: "./.heaps",
    platform: "node",
    external: ["zod", "@heaps/engine", "@heaps/common", "@heaps/server"],
    target: ["esnext"],
    resolveExtensions: [".ts"],
    minify: false,
  });

  const modules = uncachedRequire(path.resolve("./.heaps/index.js"));

  const handlers: {
    [key: string]: (data: any) => Promise<void>;
  } = {};
  for (const event of source.events) {
    handlers[`handle${event.name}`] = modules?.[`handle${event.name}`];
  }
  const store = modules.store;
  const events = await loadEvents(options, source);
  await events.reduce(async (acc, event) => {
    await acc;
    const handler = handlers[`handle${event.event}`];
    if (handler) {
      await handler(event);
    } else {
      console.log("No handler found for", event.event);
    }
  }, Promise.resolve());
  await store.sql.end();
}

export async function backfill(options: BackfillOptions) {
  const config = loadConfig(options);
  await fetchSnapshots(config, options);
  await setupStore(options);

  if (options.target) {
    const source = config.sources.find((s) => s.name === options.target);
    if (!source) throw new Error(`Source ${options.target} not found`);
    await seedStore(source, options);
  } else {
    await Promise.all(
      config.sources.map((source) => seedStore(source, options))
    );
  }
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
