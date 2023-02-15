import { CAC } from "cac";
import { codegen } from "./codegen";
import { backfill } from "./backfill";

export function registerCommands(cli: CAC) {
  cli
    .command("codegen", "Generate types for your schemas")
    .option(
      "--pathToModels [path]",
      "Path to file containing model schemas for entities",
      {
        default: "./src/models.ts",
      }
    )
    .option(
      "--pathToConfig [path]",
      "Path to config containing supergraph options",
      {
        default: "./supergraph.json",
      }
    )
    .option(
      "--outputDir [path]",
      "Path where cli should output generated entity",
      {
        default: "./src/types/",
      }
    )
    .option("--watch", "Watch for changes and rebuild", {
      default: false,
    })
    .action(codegen);

  cli
    .command("backfill", "Backfill data from a snapshot")
    .option("--pathToSnapshot [path]", "Path to snapshot file", {
      default: "./events.csv",
    })
    .option(
      "--pathToConfig [path]",
      "Path to config containing supergraph options",
      {
        default: "./supergraph.json",
      }
    )
    .option("--pathToSetupScript [path]", "Path to setup file", {
      default: "./store.setup.ts",
    })
    .option("--watch", "Watch for changes and rebuild", {
      default: false,
    })
    .action(backfill);

  cli.help();
  cli.version("0.0.1");
}
