import { CAC } from "cac";
import { codegen } from "./command";

export function registerCodegenCommands(cli: CAC) {
  cli
    .command("codegen")
    .option("--watch", "Watch mode")
    .option("--pathToSchema", "Path to schema definition", {
      default: "./schema.graphql",
    })
    .option("--storeImportPath", "Path to store definition", {
      default: "../../store",
    })
    .option("--pathToConfig", "Path to supergraph config", {
      default: "./supergraph.json",
    })
    .option("--outputDir", "Directory to output artifacts too", {
      default: "./src/types",
    })
    .action(codegen);
  return cli;
}
