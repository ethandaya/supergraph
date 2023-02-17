import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityGenerator } from "../src";
import { baseSchema } from "@heaps/engine/src";
import { z } from "zod";

vi.mock("fs");

const TestSchema = baseSchema.extend({
  id: z.string(),
});
describe("Entity Generator", () => {
  let entityGenerator: EntityGenerator;
  beforeEach(() => {
    entityGenerator = new EntityGenerator({
      outputPath: "./schema.ts",
      storeImportPath: "./store",
      modelImportPath: "./models",
      isAsync: true,
      models: {
        TestSchema,
      },
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
    entityGenerator.generateEntityForModel("TestSchema", TestSchema);
    const sourceFile = entityGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "export class TestSchema extends AsyncCrudEntity<\\"TestSchema\\", TestSchemaModel, typeof TestSchemaSchema> {
          constructor(id: string, data?: TestSchemaModel) {
              super(id, \\"TestSchema\\", TestSchemaSchema, store)
              this._data = { id, ...data } || {};
          }

          static async load(id: string): Promise<TestSchema | null> {
              const data = await store.get(\\"TestSchema\\", id);
              if (!data) {
                 return new TestSchema(id);
              }

              return new TestSchema(id, data);
          }

          get id(): TestSchemaModel[\\"id\\"] {
              const value = this.get(\\"id\\")
              if (typeof value === \\"undefined\\") {
                throw new KeyAccessError<TestSchema>(\\"id\\")
              }

              return value
          }

          set id(value: TestSchemaModel[\\"id\\"]) {
              this.set(\\"id\\", value);
          }

          get updatedAt(): TestSchemaModel[\\"updatedAt\\"] {
              const value = this.get(\\"updatedAt\\")
              if (typeof value === \\"undefined\\") {
                throw new KeyAccessError<TestSchema>(\\"updatedAt\\")
              }

              return value
          }

          set updatedAt(value: TestSchemaModel[\\"updatedAt\\"]) {
              this.set(\\"updatedAt\\", value);
          }

          get createdAt(): TestSchemaModel[\\"createdAt\\"] {
              const value = this.get(\\"createdAt\\")
              if (typeof value === \\"undefined\\") {
                throw new KeyAccessError<TestSchema>(\\"createdAt\\")
              }

              return value
          }

          set createdAt(value: TestSchemaModel[\\"createdAt\\"]) {
              this.set(\\"createdAt\\", value);
          }
      }
      "
    `);
  });
});
