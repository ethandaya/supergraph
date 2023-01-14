import { EntityGenerator } from "../src/commands/codegen/generator";
import os from "os";
import { z } from "zod";
import * as fs from "fs";

const TestSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  address: z.string(),
});

describe("Generator", () => {
  let generator: EntityGenerator;
  let outputPath: string;

  beforeEach(() => {
    outputPath = os.tmpdir() + "/schema.ts";
    generator = new EntityGenerator({
      models: { test: TestSchema },
      outputPath,
    });
  });

  it("should generate an entity & model definition for a schema with a nullable field", () => {
    generator.generateDefinitionsForModel("Test", TestSchema);
    expect(generator.targetFile.getFullText()).toMatchSnapshot();
  });

  it("should generate a global type for all schemas", () => {
    generator.generateGlobalDefinitions();
    expect(generator.targetFile.getFullText()).toMatchSnapshot();
  });
  it("should generate the full type set", () => {
    generator.generate({
      shouldSave: true,
    });
    expect(generator.targetFile.getFullText()).toMatchSnapshot();
  });
  it("should generate the full type set with a custom output path", () => {
    generator.generate({
      shouldSave: true,
    });
    expect(generator.targetFile.getFullText()).toMatch(
      fs.readFileSync(outputPath, "utf-8")
    );
  });
});
