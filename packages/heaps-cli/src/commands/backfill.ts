import { CAC } from "cac";
import { watch } from "chokidar";

type BackfillOptions = {
  watch: boolean;
  pathToSnapshot: string;
  pathToSetupScript: string;
  pathToConfig: string;
  mappingDir: string;
};

export function backfill(options: BackfillOptions) {
  console.log("backfill");
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
    .option("--pathToSnapshot <path>", "Path to snapshot")
    .option("--pathToSetupScript <path>", "Path to setup script")
    .option("--pathToConfig <path>", "Path to config")
    .option("--mappingDir <path>", "Path to mapping directory", {
      default: "./src",
    })
    .action(backfill);
  return cli;
}
