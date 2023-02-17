import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModelGenerator } from "../src";

vi.mock("fs", () => ({
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(
    () => `
    enum MyEnum {
        A
        B
    }
    type DelegationEvent @entity {
        id: ID!
        name: String!
        myEnum: MyEnum!
    }
  `
  ),
}));

describe("Model Generator", () => {
  let modelGenerator: ModelGenerator;
  beforeEach(() => {
    modelGenerator = new ModelGenerator({
      outputPath: "./models.ts",
      schemaPath: "./schema.graphql",
    });
  });

  it("should generate model imports", () => {
    modelGenerator.generate();
    const sourceFile = modelGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "import { z } from \\"zod\\";
      import { baseSchema } from \\"@heaps/engine\\";

      export const MyEnum = z.enum([\\"A\\", \\"B\\"]);
      export const DelegationEventSchema = baseSchema.extend({ name: z.string(), myEnum: MyEnum });
      "
    `);
  });

  it("should generate model ", () => {
    modelGenerator.generate();
    const sourceFile = modelGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "import { z } from \\"zod\\";
      import { baseSchema } from \\"@heaps/engine\\";

      export const MyEnum = z.enum([\\"A\\", \\"B\\"]);
      export const DelegationEventSchema = baseSchema.extend({ name: z.string(), myEnum: MyEnum });
      "
    `);
  });
});
