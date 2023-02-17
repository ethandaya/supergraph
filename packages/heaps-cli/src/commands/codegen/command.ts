import { EntityGenerator, ModelGenerator } from "@heaps/generators";
import { loadConfig } from "../../utils/load";
import fs from "fs";
import { EventGenerator } from "@heaps/generators";

type CodegenOptions = {
  watch: boolean;
  pathToSchema: string;
  pathToConfig: string;
  outputDir: string;
};
export async function codegen(options: CodegenOptions) {
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
    modelImportPath: outputDir + "./models",
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
  await modelGenerator.generate(true);
  await entityGenerator.generate(true);
}
