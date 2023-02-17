import { CAC } from "cac";
import { registerCodegenCommands } from "./commands/codegen";

export function registerCommands(cli: CAC) {
  let heaps: CAC = cli;
  heaps = registerCodegenCommands(heaps);

  heaps.command("hello").action(() => {
    console.log("world");
  });

  heaps.help();
  heaps.version("0.0.1");
}
