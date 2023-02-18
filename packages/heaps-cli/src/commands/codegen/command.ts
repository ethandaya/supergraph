import {
  EntityGenerator,
  EventGenerator,
  ModelGenerator,
} from "@heaps/generators";
import { loadConfig } from "../../utils/load";
import fs from "fs";
import { watch } from "chokidar";

export type CodegenOptions = {
  watch: boolean;
  pathToSchema: string;
  pathToConfig: string;
  outputDir: string;
  mappingDir: string;
};
export function buildArtifacts(options: Omit<CodegenOptions, "watch">) {
  const config = loadConfig(options);
  const { pathToSchema, outputDir } = options;
  const modelGenerator = new ModelGenerator({
    schemaPath: pathToSchema,
    outputPath: outputDir + "/models.ts",
  });
  const entityGenerator = new EntityGenerator({
    isAsync: false,
    schemaPath: pathToSchema,
    outputPath: outputDir + "/schema.ts",
    storeImportPath: "./store",
    modelImportPath: "./models",
  });
  for (const idx in config.sources) {
    const source = config.sources[idx];
    fs.mkdirSync(outputDir + `/${source.name}`, { recursive: true });
    const abi = JSON.parse(fs.readFileSync(source.abi, "utf-8"));
    const eventGenerator = new EventGenerator({
      abi,
      outputPath: outputDir + `/${source.name}/${source.name}.ts`,
    });
    eventGenerator.generate(true);
  }
  modelGenerator.generate(true);
  entityGenerator.generate(true);
}

export function codegen(options: CodegenOptions) {
  buildArtifacts(options);
  if (options.watch) {
    console.log("Watching for Changes...");
    watch(options.pathToSchema).on("change", async () => {
      console.log("Change detected, regenerating...");
      try {
        await codegen(options);
      } catch (e) {
        console.error("Error while regenerating");
        console.error(e);
      }
    });
  }
}