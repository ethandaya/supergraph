import { EntityGenerator, ModelGenerator } from "@heaps/generators";

type CodegenOptions = {
  watch: boolean;
  pathToSchema: string;
  outputDir: string;
};
export async function codegen(options: CodegenOptions) {
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
  await modelGenerator.generate(true);
  await entityGenerator.generate(true);
}
