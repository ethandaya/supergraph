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
      import { CrudEntity, KeyAccessError } from \\"@heaps/engine\\";
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

      export class Test extends CrudEntity<\\"Test\\", TestModel, typeof TestSchema> {
          constructor(id: string, data?: TestModel) {
              super(id, \\"Test\\", TestSchema)
              this._data = { id, ...data } || { id };
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

          static async load(id: string): Promise<Test | null> {
              const data = await store.get(\\"Test\\", id);
              if (!data) {
                 return null
              }

              return new Test(id, data);
          }

          async save() {
              const dto = this._schema.extend({
              updatedAt: z.bigint().optional(),
              createdAt: z.bigint().optional(),
              }).parse({ id: this._id, ...this._data });
              this._data = await store.set(\\"Test\\", this.id, dto);
              return this._data;
          }
      }
      "
    `);
  });
});
