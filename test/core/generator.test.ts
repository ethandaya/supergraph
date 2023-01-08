import { NounSchema } from "../../src/mapping/models";
import { EntityGenerator } from "../../src/core/codegen/generator";
import * as path from "path";

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

  it("should generate an entity & model definition for a schema with a nullable field", () => {
    generator.generateDefinitionsForModel("Noun", NounSchema);
    expect(generator.targetFile.getFullText()).toMatchSnapshot();
  });

  it("should generate a global type for all schemas", () => {
    generator.generateGlobalDefinitions();
    expect(generator.targetFile.getFullText()).toMatchSnapshot();
  });
  it("should generate an entity & model definition for a schema with nullables", () => {
    generator.generate();
    expect(generator.targetFile.getFullText()).toMatchSnapshot();
  });
});
