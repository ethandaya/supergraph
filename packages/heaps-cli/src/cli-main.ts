import { cac } from "cac";
import { registerCommands } from "./commands";

export async function main() {
  const cli = cac("heaps");

  registerCommands(cli);

  cli.help();
  cli.version("0.0.1");

  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
}
