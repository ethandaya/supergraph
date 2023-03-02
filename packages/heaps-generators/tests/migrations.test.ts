import { beforeEach, describe, expect, it, vi } from "vitest";
import { MigrationGenerator } from "../src";

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
        biginnt: BigInt!
        decimmmal: BigInt!
        arrayType: [String!]!
    }
  `
  ),
}));

describe("Migration Generator", () => {
  let migrationGenerator: MigrationGenerator;
  beforeEach(() => {
    migrationGenerator = new MigrationGenerator({
      outputPath: "./migrations.ts",
      schemaPath: "./schema.graphql",
    });
  });

  it("should generate enums", () => {
    migrationGenerator.generateEnums();
    expect(migrationGenerator.file).toMatchInlineSnapshot(`
      "
            CREATE TYPE my_enum AS ENUM ('A','B');

      "
    `);
  });

  it("should generate tables", () => {
    migrationGenerator.generateMigrations();
    expect(migrationGenerator.file).toMatchInlineSnapshot(`
      "
            CREATE TABLE IF NOT EXISTS delegationevent (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      my_enum my_enum NOT NULL,
      biginnt BIGINT NOT NULL,
      decimmmal BIGINT NOT NULL,
      array_type TEXT[] NOT NULL,
      created_at BIGINT,
      updated_at BIGINT
      );"
    `);
  });

  it("should generate migrations", () => {
    migrationGenerator.generate(false);
    expect(migrationGenerator.file).toMatchInlineSnapshot(`
      "DROP TABLE IF EXISTS delegationevent;
      DROP TYPE IF EXISTS my_enum;

            CREATE TYPE my_enum AS ENUM ('A','B');


            CREATE TABLE IF NOT EXISTS delegationevent (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      my_enum my_enum NOT NULL,
      biginnt BIGINT NOT NULL,
      decimmmal BIGINT NOT NULL,
      array_type TEXT[] NOT NULL,
      created_at BIGINT,
      updated_at BIGINT
      );"
    `);
  });
});
