import * as path from "path";
import { bundle } from "../../utils/build";
import { uncachedRequire } from "@heaps/common";
import { watch } from "chokidar";
import fs from "fs";

type BackfillOptions = {
  watch: boolean;
  pathToSnapshot: string;
  pathToSetupFile: string;
};

function loadSnapshot(pathToSnapshot: string) {
  console.log("Loading snapshot...");
  const raw = fs.readFileSync(pathToSnapshot, "utf-8");
  const events = JSON.parse(raw);
  console.log(`Loaded ${events.length} events`);
  return events;
}

async function setup(options: BackfillOptions) {
  if (!options.pathToSetupFile) return;
  console.log("Running Setup");
  const outputPath = await bundle(options.pathToSetupFile);
  const setup = uncachedRequire(path.resolve(outputPath));
  if (setup.default && typeof setup.default === "function") {
    setup.default();
  }
}

async function runHandlers(options: BackfillOptions) {
  const events = loadSnapshot(options.pathToSnapshot);
  console.log(`Running ${events.length} events`);
}

export async function backfill(options: BackfillOptions) {
  await setup(options);
  if (options.watch) {
    console.log("Watching for changes...");
    watch("./src").on("change", async () => {
      await setup(options);
      await runHandlers(options);
    });
  }
}
