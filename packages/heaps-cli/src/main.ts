import { CAC } from "cac";
import { registerCodegenCommands } from "./commands/codegen";
import { registerBackfillCommands } from "./commands/backfill";

export function registerCommands(cli: CAC) {
  let heaps: CAC = cli;

  heaps = registerCodegenCommands(heaps);
  heaps = registerBackfillCommands(heaps);

  heaps.command("hello").action(() => {
    console.log("world");
  });

  heaps.help();
  heaps.version("0.0.1");
}
