import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModelGenerator } from "../src";

// vi.mock(
//   "./schema.graphql",
//   () => `
// type DelegationEvent @entity {
//     id: ID!
//     name: String!
// }
// `
// );

vi.mock("fs", () => ({
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(
    () => `
    type DelegationEvent @entity {
        id: ID!
        name: String!
    }
  `
  ),
}));

describe("Model Generator", () => {
  let modelGenerator: ModelGenerator;
  beforeEach(() => {
    modelGenerator = new ModelGenerator({
      outputPath: "./schema.ts",
      schemaPath: "./schema.graphql",
    });
  });

  it("should generate model imports", () => {
    modelGenerator.generate();
    const sourceFile = modelGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "import { z } from \\"zod\\";
      import { baseSchema } from \\"@heaps/engine\\";

      export const DelegationEvent = baseSchema.extend({ id: z.string(), name: z.string() });
      "
    `);
  });

  it("should generate model ", () => {
    modelGenerator.generate();
    const sourceFile = modelGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "import { z } from \\"zod\\";
      import { baseSchema } from \\"@heaps/engine\\";

      export const DelegationEvent = baseSchema.extend({ id: z.string(), name: z.string() });
      "
    `);
  });
});
