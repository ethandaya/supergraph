import * as path from "path";
import { bundle } from "../../utils/build";
import { SuperGraphConfig, uncachedRequire } from "@heaps/common";
import fs from "fs";
import csv from "csv-parser";
import { parseEther } from "@ethersproject/units";
import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";
import { loadConfig } from "../../utils/load";
import * as console from "console";
import { watch } from "chokidar";

type BackfillOptions = {
  watch: boolean;
  pathToSnapshot: string;
  pathToSetupScript: string;
  pathToConfig: string;
};

async function loadSnapshot(pathToSnapshot: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any = [];
    fs.createReadStream(pathToSnapshot)
      .pipe(csv())
      .on("data", (data) =>
        results.push({ ...data, params: JSON.parse(data.params) })
      )
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => reject(error));
  });
}

async function loadHandlersFromConfig(config: SuperGraphConfig): Promise<{
  // TODO - add explicit types for handlers
  [key: string]: (dto: any) => Promise<void> | void;
}> {
  const mappings = config.sources.map((source) => source.mapping);
  const bundledHandlers = await Promise.all(mappings.map(bundle));
  const handlers = bundledHandlers.reduce((acc, handler) => {
    const module = uncachedRequire(path.resolve(handler));
    return { ...acc, ...module };
  }, {});
  console.log(
    `Loaded ${Object.keys(handlers).length} handlers from config: ${Object.keys(
      handlers
    ).join(", ")}`
  );
  return handlers;
}

async function runHandlers(options: BackfillOptions) {
  console.log("Running Backfill...");
  const config = loadConfig(options);
  const events = await loadSnapshot(options.pathToSnapshot);
  const handlers = await loadHandlersFromConfig(config);
  for (const event of events.slice(0, 100)) {
    console.log(
      "Percent backfilled: ",
      (events.indexOf(event) / events.length) * 100,
      "%"
    );
    if (handlers[`handle${event.event}`]) {
      const dto = {
        params: {
          ...Object.keys(event.params).reduce<any>((acc, key) => {
            if (isBigNumberish(event.params[key])) {
              acc[key] = BigInt(event.params[key]);
              return acc;
            }
            acc[key] = event.params[key];
            return acc;
          }, {}),
          sender: event.sender,
          value: parseEther(event.value).toBigInt(),
        },
        block: {
          number: BigInt(event.block_number),
          timestamp: event.block_timestamp,
        },
        transaction: {
          hash: event.tx_hash,
          index: BigInt(event.tx_index),
        },
        backfill: true,
      };
      await handlers[`handle${event.event}`](dto);
    }
  }
  console.log("Backfill Complete!");
}

async function setup(options: BackfillOptions) {
  if (!options.pathToSetupScript) return;
  const outputPath = await bundle(options.pathToSetupScript);
  console.log(`Setup Script Bundled to ${outputPath}`);
  const script = uncachedRequire(path.resolve(outputPath));
  if (script.default && typeof script.default === "function") {
    await script.default();
  }
}

export async function backfill(options: BackfillOptions) {
  await setup(options);
  await runHandlers(options);

  if (options.watch) {
    console.log("Watching for changes...");
    watch(["./src"]).on("change", async () => {
      try {
        await setup(options);
        await runHandlers(options);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
