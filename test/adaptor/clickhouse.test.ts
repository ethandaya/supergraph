import { ClickhouseAdaptor } from "../../src/core/database/schema/adaptors/clickhouse";
import fs from "fs/promises";
import { parse } from "graphql/language";

const filename = "./schema.graphql";
describe("Clickhouse Adaptor", () => {
  const parser: ClickhouseAdaptor = {} as ClickhouseAdaptor;
  // const expectedSQL: string = "";

  beforeAll(async () => {
    const document = await fs.readFile(filename, "utf-8");
    const ast = parse(document);
    parser = new ClickhouseAdaptor(ast);
    // expectedSQL = await fs.readFile(expectedSchemaPath, "utf-8");
  });

  describe("should be able to map ", () => {
    it("Column Definition to String Field", () => {
      const column = {
        name: "name",
        type: "STRING",
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("name STRING NOT NULL");
    });
    it('Column Definition to String Field with "nullable" flag', () => {
      const column = {
        name: "name",
        type: "STRING",
        isNullable: true,
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("name STRING");
    });
    it("Column Definition to Int Field", () => {
      const column = {
        name: "age",
        type: "INTEGER",
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("age INTEGER NOT NULL");
    });
    it("Column Definition to Float Field", () => {
      const column = {
        name: "height",
        type: "FLOAT",
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("height FLOAT NOT NULL");
    });
    it("Column Definition to Boolean Field", () => {
      const column = {
        name: "isAlive",
        type: "BOOLEAN",
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("isAlive BOOLEAN NOT NULL");
    });
    it("Column Definition to Date Field", () => {
      const column = {
        name: "birthday",
        type: "DATETIME",
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("birthday DATETIME NOT NULL");
    });
    // TODO - BigInt, Bytes, Enum, Relation, Primary Key
    it('Column Definition for String with "array" flag to Array Field', () => {
      const column = {
        name: "nicknames",
        type: "STRING",
        isArray: true,
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("nicknames ARRAY(STRING) NOT NULL");
    });
    it('Column Definition for Int with "array" flag to Array Field', () => {
      const column = {
        name: "ages",
        type: "INTEGER",
        isArray: true,
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("ages ARRAY(INTEGER) NOT NULL");
    });
    it('Column Definition for String with "array" and "relation" flags to Array Field', () => {
      const column = {
        name: "nicknames",
        type: "STRING",
        isArray: true,
        isRelation: true,
      };
      const field = parser.mapColumnToClickhouseField(column);
      expect(field).toEqual("nicknamesIds ARRAY(STRING) NOT NULL");
    });
    // it("Column Definition to Enum Field", () => {
    //   const column = {
    //     name: "role",
    //     type: "ROLE",
    //     isEnum: true,
    //   };
    //   const field = parser.mapColumnToClickhouseField(column);
    // });
  });
});
