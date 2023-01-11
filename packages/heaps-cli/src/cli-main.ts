import { cac } from "cac";

export async function main() {
  const cli = cac("heaps");

  cli.command("hello", "Say hello").action(() => console.log("world"));

  cli.help();
  cli.version("0.0.1");

  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
}
