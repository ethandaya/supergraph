import fs from "fs/promises";
import { PrismaAdaptor } from "../../src/core/database/adaptors/prisma";
import { parse } from "graphql/language";
import { expect } from "@jest/globals";
import { formatSchema } from "@prisma/internals";

const filename = "./schema.graphql";
const expectedSchemaPath = "./test-schema.prisma";

describe("Prisma Adaptor", () => {
  let parser: PrismaAdaptor = {} as PrismaAdaptor;
  let expectedSchema: string = "";

  beforeAll(async () => {
    const document = await fs.readFile(filename, "utf-8");
    const ast = parse(document);
    parser = new PrismaAdaptor(ast);
    expectedSchema = await fs.readFile(expectedSchemaPath, "utf-8");
  });

  it("should be able to get enums for schema", async () => {
    const enums = parser.getEnumTypes();
    const names = enums.map((e) => e.name.value);
    expect(names).toEqual(["ProposalStatus"]);
  });

  it("should be able to map enums to prisma model", async () => {
    const enums = parser.getEnumTypes();
    const models = enums.map((e) => parser.mapEnumToPrismaModel(e));
    expect(models).toEqual([
      "enum ProposalStatus {\nPENDING\nACTIVE\nCANCELLED\nVETOED\nQUEUED\nEXECUTED\n}",
    ]);
  });

  it("should be able to get entities for schema", async () => {
    const entities = parser.getObjectTypes();
    const names = entities.map((e) => e.name.value);
    expect(names).toEqual([
      "DelegationEvent",
      "TransferEvent",
      "Seed",
      "Noun",
      "Bid",
      "Auction",
      "Account",
      "Delegate",
      "Proposal",
      "Vote",
      "Governance",
      "DynamicQuorumParams",
    ]);
  });

  it("should be able to map entities to prisma model", async () => {
    const entities = parser.getObjectTypes();
    const models = entities.map((e) => parser.mapObjectToPrismaModel(e));
    const delegationEventModel = await formatSchema({ schema: models[0] });
    const expectedModel = await formatSchema({
      schema: `
        model DelegationEvent {
          id                 Int     @id
          nounId             Int
          previousDelegateId Int
          newDelegateId      Int
          blockNumber        Decimal
          blockTimestamp     Decimal
          blockRange         Unsupported("int4range")
          createdAt          DateTime
          updatedAt          DateTime
        }
      `,
    });
    expect(delegationEventModel).toEqual(expectedModel);
  });

  it("should be able to generate a valid prisma schema", async () => {
    const schema = parser.mapSchemaToPrismaModel();
    const formattedSchema = await formatSchema({ schema });
    expect(formattedSchema).toEqual(expectedSchema);
  });
});
