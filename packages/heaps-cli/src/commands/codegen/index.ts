import { build } from "./service";
import { EntityGenerator } from "./generators/entity.generator";
import * as fs from "fs";
import { SuperGraphConfig } from "./types";
import { EventGenerator } from "./generators/event.generator";

type CodegenOptions = {
  pathToModels: string;
  pathToConfig: string;
  outputDir: string;
};

function loadConfig(pathToConfig: string): SuperGraphConfig {
  const resp = fs.readFileSync(pathToConfig, "utf-8");
  return JSON.parse(resp);
}

function buildSchema({ pathToModels, outputDir }: CodegenOptions) {
  // TODO - this is bad but works for now
  const buildPath = build(pathToModels);
  const models = require(buildPath);
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
  const config = loadConfig(options.pathToConfig);
  buildSchema(options);
  buildEvents(options, config);
}
