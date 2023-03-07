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
            CREATE TYPE \\"MyEnum\\" AS ENUM ('A','B');

      "
    `);
  });

  it("should generate tables", () => {
    migrationGenerator.generateMigrations();
    expect(migrationGenerator.file).toMatchInlineSnapshot(`
      "
            CREATE TABLE IF NOT EXISTS \\"DelegationEvent\\" (
      \\"id\\" TEXT PRIMARY KEY,
      \\"name\\" TEXT NOT NULL,
      \\"myEnum\\" MyEnum NOT NULL,
      \\"biginnt\\" BIGINT NOT NULL,
      \\"decimmmal\\" BIGINT NOT NULL,
      \\"arrayType\\" TEXT[] NOT NULL,
      \\"createdAt\\" BIGINT,
      \\"updatedAt\\" BIGINT
      );"
    `);
  });

  it("should generate migrations", () => {
    migrationGenerator.generate(false);
    expect(migrationGenerator.file).toMatchInlineSnapshot(`
      "DROP TABLE IF EXISTS \\"DelegationEvent\\";
      DROP TYPE IF EXISTS \\"MyEnum\\";

            CREATE TYPE \\"MyEnum\\" AS ENUM ('A','B');


            CREATE TABLE IF NOT EXISTS \\"DelegationEvent\\" (
      \\"id\\" TEXT PRIMARY KEY,
      \\"name\\" TEXT NOT NULL,
      \\"myEnum\\" MyEnum NOT NULL,
      \\"biginnt\\" BIGINT NOT NULL,
      \\"decimmmal\\" BIGINT NOT NULL,
      \\"arrayType\\" TEXT[] NOT NULL,
      \\"createdAt\\" BIGINT,
      \\"updatedAt\\" BIGINT
      );"
    `);
  });
});
