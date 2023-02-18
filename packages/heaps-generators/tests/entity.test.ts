import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityGenerator } from "../src";

vi.mock("fs", () => ({
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(
    () => `
    type Test @entity {
        id: ID!
        votes: [Vote!]! @derivedFrom(field: "nouns")
    }
  `
  ),
}));

describe("Entity Generator", () => {
  let entityGenerator: EntityGenerator;
  beforeEach(() => {
    entityGenerator = new EntityGenerator({
      outputPath: "./schema.ts",
      storeImportPath: "./store",
      modelImportPath: "./models",
      isAsync: true,
      schemaPath: "./schema.graphql",
    });
  });

  it("should generate model imports", () => {
    entityGenerator.generateImports();
    const sourceFile = entityGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "import { z } from \\"zod\\";
      import { AsyncCrudEntity, KeyAccessError } from \\"@heaps/engine\\";
      import { TestSchema } from \\"./models\\";
      import { store } from \\"./store\\";
      "
    `);
  });

  it("should generate global type for model", () => {
    entityGenerator.generateTypeForModel("TestSchema");
    const sourceFile = entityGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "type TestSchemaModel = z.infer<typeof TestSchemaSchema>;
      "
    `);
  });

  it("should generate entity for model", () => {
    entityGenerator.generateEntities();
    const sourceFile = entityGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "type TestModel = z.infer<typeof TestSchema>;

      export class Test extends AsyncCrudEntity<\\"Test\\", TestModel, typeof TestSchema> {
          constructor(id: string, data?: TestModel) {
              super(id, \\"Test\\", TestSchema, store)
              this._data = { id, ...data } || { id };
          }

          static async load(id: string): Promise<Test | null> {
              const data = await store.get(\\"Test\\", id);
              if (!data) {
                 return new Test(id);
              }

              return new Test(id, data);
          }

          get id(): TestModel[\\"id\\"] {
              const value = this.get(\\"id\\")
              if (typeof value === \\"undefined\\" && value !== null) {
                throw new KeyAccessError<Test>(\\"id\\")
              }

              return value
          }

          set id(value: TestModel[\\"id\\"]) {
              this.set(\\"id\\", value);
          }
      }
      "
    `);
  });
});
