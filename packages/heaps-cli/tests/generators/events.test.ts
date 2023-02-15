import { EventGenerator } from "../../src/commands/codegen/generators/event.generator";
import { testAbi } from "../stubs/abi";
import os from "os";
import fs from "fs";
import { beforeEach, describe, expect, it } from "vitest";

describe("Entity Generator", () => {
  let generator: EventGenerator;
  let outputPath: string;

  beforeEach(() => {
    outputPath = os.tmpdir() + "/schema.ts";
    generator = new EventGenerator({
      abi: testAbi,
      outputPath,
    });
  });

  it("should generate inline abi event variables", () => {
    generator.inlineAbiEvents();
    expect(generator.targetFile.getFullText()).toMatchInlineSnapshot(`
      "const abi = narrow([
            {
              \\"anonymous\\": false,
              \\"inputs\\": [
                {
                  \\"indexed\\": true,
                  \\"internalType\\": \\"uint256\\",
                  \\"name\\": \\"nounId\\",
                  \\"type\\": \\"uint256\\"
                },
                {
                  \\"indexed\\": false,
                  \\"internalType\\": \\"address\\",
                  \\"name\\": \\"sender\\",
                  \\"type\\": \\"address\\"
                },
                {
                  \\"indexed\\": false,
                  \\"internalType\\": \\"uint256\\",
                  \\"name\\": \\"value\\",
                  \\"type\\": \\"uint256\\"
                },
                {
                  \\"indexed\\": false,
                  \\"internalType\\": \\"bool\\",
                  \\"name\\": \\"extended\\",
                  \\"type\\": \\"bool\\"
                }
              ],
              \\"name\\": \\"AuctionBid\\",
              \\"type\\": \\"event\\"
            }
          ]);
      "
    `);
  });

  it("should be able to generate type signature for event type", () => {
    generator.generateTypesForEvent("AuctionCreated");
    expect(generator.targetFile.getFullText()).toMatchInlineSnapshot(`
      "export type AuctionCreatedEvent = ExtractAbiEvent<typeof abi, \\"AuctionCreated\\">;
      export type AuctionCreatedEventKeyType = AuctionCreatedEvent[\\"inputs\\"][number][\\"name\\"];
      export type AuctionCreatedEventParamType = AbiParametersToPrimitiveTypes<AuctionCreatedEvent[\\"inputs\\"]>;
      export type AuctionCreated = SuperGraphEventType<{ [key in AuctionCreatedEventKeyType]: AuctionCreatedEventParamType[number] }>;
      "
    `);
  });

  it("should be able to generate types for all events", () => {
    generator.generateEventTypes();
    expect(generator.targetFile.getFullText()).toMatchInlineSnapshot(`
      "export type AuctionBidEvent = ExtractAbiEvent<typeof abi, \\"AuctionCreated\\">;
      export type AuctionBidEventKeyType = AuctionBidEvent[\\"inputs\\"][number][\\"name\\"];
      export type AuctionBidEventParamType = AbiParametersToPrimitiveTypes<AuctionBidEvent[\\"inputs\\"]>;
      export type AuctionBid = SuperGraphEventType<{ [key in AuctionBidEventKeyType]: AuctionBidEventParamType[number] }>;
      "
    `);
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
