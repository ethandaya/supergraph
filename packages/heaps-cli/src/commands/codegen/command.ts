import { build } from "./service";
import { EntityGenerator } from "./generator";
import { getFullPath } from "@heaps/common/src";

type CodegenOptions = {
  pathToModels: string;
  outputPath: string;
};

export async function codegen(options: CodegenOptions) {
  let { pathToModels, outputPath } = options;
  // TODO - this is bad but works for now
  const buildPath = build(pathToModels);
  const models = require(buildPath);
  const generator = new EntityGenerator({
    models,
    outputPath: getFullPath(outputPath),
  });
  generator.generate();
}
