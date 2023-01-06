import { generateClassForSchema } from "../../src/core/generator";
import { NounSchema, SeedSchema } from "../../src/mapping/models";

describe("Generator", () => {
  it("should generate an entity & model definition for a schema", () => {
    const classDefinition = generateClassForSchema("Seed", SeedSchema);
    expect(classDefinition).toMatchSnapshot();
  });
  it("should generate an entity & model definition for a schema with nullables", () => {
    const classDefinition = generateClassForSchema("Noun", NounSchema);
    expect(classDefinition).toMatchSnapshot();
  });
});
