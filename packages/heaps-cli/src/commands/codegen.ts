import { CAC } from "cac";
import { loadConfig } from "../utils/load";
import {
  EntityGenerator,
  EventGenerator,
  ModelGenerator,
} from "@heaps/generators";
import fs from "fs";
import { watch } from "chokidar";

export type CodegenOptions = {
  watch: boolean;
  pathToSchema: string;
  // TODO - design of store path needs a lot of work
  storeImportPath: string;
  pathToConfig: string;
  outputDir: string;
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
    storeImportPath: options.storeImportPath,
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

export function registerCodegenCommands(cli: CAC) {
  cli
    .command("codegen")
    .option("--watch", "Watch mode")
    .option("--pathToSchema", "Path to schema definition", {
      default: "./schema.graphql",
    })
    .option("--storeImportPath", "Path to store definition", {
      default: "../../store",
    })
    .option("--pathToConfig", "Path to supergraph config", {
      default: "./supergraph.json",
    })
    .option("--outputDir", "Directory to output artifacts too", {
      default: "./src/types",
    })
    .action(codegen);
  return cli;
}
