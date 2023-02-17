import * as fs from "fs";
import { SuperGraphConfig } from "./types";
import { EventGenerator } from "./generators/event.generator";
import { loadConfig } from "../../utils/load";

type CodegenOptions = {
  pathToStore: string;
  pathToModels: string;
  pathToConfig: string;
  outputDir: string;
  watch: boolean;
};

function buildEvents({ outputDir }: CodegenOptions, config: SuperGraphConfig) {
  for (const idx in config.sources) {
    const source = config.sources[idx];
    const abi = JSON.parse(fs.readFileSync(source.abi, "utf-8"));
    const eventGenerator = new EventGenerator({
      abi,
      outputPath: outputDir + `/${source.name}/${source.name}.ts`,
    });
    eventGenerator.generate();
  }
}

export async function codegen(options: CodegenOptions) {
  if (options.watch) {
    console.log("Watching for changes...");
    fs.watch(options.pathToModels, async () => {
      console.log("Change detected, rebuilding...");
    });
    fs.watch(options.pathToConfig, () => {
      console.log("Change detected, rebuilding...");
      const config = loadConfig(options);
      buildEvents(options, config);
    });
  } else {
    const config = loadConfig(options);
    buildEvents(options, config);
  }
}
