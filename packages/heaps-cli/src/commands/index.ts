import { CAC } from "cac";
import { codegen } from "./codegen";

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
    .action(codegen);

  cli.help();
  cli.version("0.0.1");
}
