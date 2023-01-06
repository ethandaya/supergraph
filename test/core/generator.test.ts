import { generateClassForSchema } from "../../src/core/generator";
import { SeedSchema } from "../../src/mapping/models";

describe("Generator", () => {
  it("should generate an entity & model definition for a schema", () => {
    const classDefinition = generateClassForSchema("Seed", SeedSchema);
    expect(classDefinition).toMatchSnapshot();
  });
});
