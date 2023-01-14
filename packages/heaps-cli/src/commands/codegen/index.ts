import { EntityGenerator } from "./generator";

type CodegenOptions = {
  pathToModels: string;
  outputPath: string;
};
export async function codegen(options: CodegenOptions) {
  const { pathToModels, outputPath } = options;
  const models = await import(pathToModels);
  const generator = new EntityGenerator({
    models: models,
    outputPath,
  });
  generator.generate();
}
