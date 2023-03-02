import { CAC } from "cac";
import { loadConfig } from "../utils/load";
import {
  EntityGenerator,
  EventGenerator,
  ModelGenerator,
  MigrationGenerator,
} from "@heaps/generators";
import fs from "fs";
import { watch } from "chokidar";

export type CodegenOptions = {
  watch: boolean;
  pathToSchema: string;
  storeImportPath: string;
  pathToConfig: string;
  outputDir: string;
  isAsyncStore: boolean;
};
export function buildArtifacts(options: Omit<CodegenOptions, "watch">) {
  const config = loadConfig(options);
  const { pathToSchema, outputDir } = options;
  console.log("Generating Artifacts... ", outputDir);
  const modelGenerator = new ModelGenerator({
    schemaPath: pathToSchema,
    outputPath: outputDir + "/models.ts",
  });
  const entityGenerator = new EntityGenerator({
    isAsync: options.isAsyncStore,
    schemaPath: pathToSchema,
    outputPath: outputDir + "/schema.ts",
    storeImportPath: options.storeImportPath,
    modelImportPath: "./models",
  });
  const migrationGenerator = new MigrationGenerator({
    schemaPath: pathToSchema,
    outputPath: outputDir + "/migrations.txt",
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
  migrationGenerator.generate(true);
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
    .option("--pathToSchema <path>", "Path to schema definition", {
      default: "./schema.graphql",
    })
    .option("--storeImportPath <path>", "Path to store definition", {
      default: "../../store",
    })
    .option("--pathToConfig <path>", "Path to supergraph config", {
      default: "./supergraph.json",
    })
    .option("--outputDir <path>", "Directory to output artifacts too", {
      default: "./src/types",
    })
    .option("--isAsyncStore", "Generate Async Entities")
    .action(codegen);
  return cli;
}
