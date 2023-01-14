import { CAC } from "cac";
import { codegen } from "./codegen";

export function registerCommands(cli: CAC) {
  cli
    .command("codegen", "Generate types for your schemas")
    .option(
      "--pathToModels [path]",
      "Path to file containing model schemas for entities",
      {
        default: "models.ts",
      }
    )
    .option(
      "--outputPath [path]",
      "Path where cli should output generated entity",
      {
        default: "types/schema.ts",
      }
    )
    .action(codegen);

  cli.help();
  cli.version("0.0.1");
}
