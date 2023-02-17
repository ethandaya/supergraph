import { CAC } from "cac";
import { codegen } from "./command";

export function registerCodegenCommands(cli: CAC) {
  cli
    .command("codegen")
    .option("--watch", "Watch mode")
    .option("--schema", "Generate schemas for defined entities")
    .option("--entities", "Generate entities for defined entities")
    .option("--pathToSchema", "Generate entities for defined entities")
    .option("--pathToConfig", "Generate entities for defined entities")
    .action(codegen);
  return cli;
}
