import { CAC } from "cac";
import { codegen } from "./command";

export function registerCodegenCommands(cli: CAC) {
  cli
    .command("codegen")
    .option("--watch", "Watch mode")
    .option("--pathToSchema", "Generate entities for defined entities", {
      default: "./schema.graphql",
    })
    .option("--pathToConfig", "Generate entities for defined entities", {
      default: "./supergraph.json",
    })
    .option("--outputDir", "Generate entities for defined entities", {
      default: "./src/types",
    })
    .option("--mappingDir", "Generate entities for defined entities", {
      default: "./src",
    })
    .action(codegen);
  return cli;
}
