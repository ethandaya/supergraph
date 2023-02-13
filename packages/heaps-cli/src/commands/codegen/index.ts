import { bundle } from "../../utils/build";
import { EntityGenerator } from "./generators/entity.generator";
import * as fs from "fs";
import { SuperGraphConfig } from "./types";
import { EventGenerator } from "./generators/event.generator";
import { uncachedRequire } from "@heaps/common";
import path from "path";
import { loadConfig } from "../../utils/load";

type CodegenOptions = {
  pathToModels: string;
  pathToConfig: string;
  outputDir: string;
  watch: boolean;
};

async function buildSchema({ pathToModels, outputDir }: CodegenOptions) {
  const buildPath = await bundle(pathToModels);
  const models = uncachedRequire(path.resolve(buildPath));
  const entityGenerator = new EntityGenerator({
    models,
    outputPath: outputDir + "/schema.ts",
  });
  entityGenerator.generate();
}

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
      await buildSchema(options);
    });
    fs.watch(options.pathToConfig, () => {
      console.log("Change detected, rebuilding...");
      const config = loadConfig(options);
      buildEvents(options, config);
    });
  } else {
    const config = loadConfig(options);
    await buildSchema(options);
    buildEvents(options, config);
  }
}
