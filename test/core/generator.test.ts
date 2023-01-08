import { NounSchema } from "../../src/mapping/models";
import { EntityGenerator } from "../../src/core/codegen/generator";
import path from "path";
import { beforeEach, describe, expect, it } from "@jest/globals";

export function getFullPath(filePath: string): string {
  return path.join(process.cwd(), filePath);
}
describe("Generator", () => {
  let generator: EntityGenerator;

  beforeEach(() => {
    generator = new EntityGenerator(
      getFullPath("./src/mapping/models.ts"),
      getFullPath("./src/mapping/types/schema.ts")
    );
  });

  // it("should generate an entity & model definition for a schema", () => {
  //   generator.generateDefinitionsForModel("Seed", SeedSchema);
  //   expect(generator.targetFile.getFullText()).toMatchSnapshot();
  // });
  it("should generate an entity & model definition for a schema with a nullable field", () => {
    generator.generateDefinitionsForModel("Noun", NounSchema);
    expect(generator.targetFile.getFullText()).toMatchSnapshot();
  });
  // it("should generate an entity & model definition for a schema with nullables", () => {
  //   generator.generate();
  //   generator.targetFile.saveSync();
  //   // console.log(generator.targetFile.getFullText());
  // });
});
