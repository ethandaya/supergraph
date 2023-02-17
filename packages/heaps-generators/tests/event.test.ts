import { beforeEach, describe, expect, it } from "vitest";
import { EventGenerator } from "../src";

describe("Event Generator", () => {
  let eventGenerator: EventGenerator;
  beforeEach(() => {
    eventGenerator = new EventGenerator({
      outputPath: "./events.ts",
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "TokenEvent",
          type: "event",
        },
      ],
    });
  });

  it("should generate event imports", () => {
    eventGenerator.generateImports();
    const sourceFile = eventGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "import { AbiParametersToPrimitiveTypes, ExtractAbiEvent, narrow } from \\"abitype\\";
      import { SuperGraphEventType } from \\"@heaps/engine\\";
      "
    `);
  });

  it("should generate abi types", () => {
    eventGenerator.inlineAbiEvents();
    const sourceFile = eventGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "const abi = narrow([
            {
              \\"anonymous\\": false,
              \\"inputs\\": [
                {
                  \\"indexed\\": true,
                  \\"internalType\\": \\"uint256\\",
                  \\"name\\": \\"tokenId\\",
                  \\"type\\": \\"uint256\\"
                }
              ],
              \\"name\\": \\"TokenEvent\\",
              \\"type\\": \\"event\\"
            }
          ]);
      "
    `);
  });

  it("should generate event types", () => {
    eventGenerator.generateEventTypes();
    const sourceFile = eventGenerator.targetFile.getFullText();
    expect(sourceFile).toMatchInlineSnapshot(`
      "export type TokenEventEvent = ExtractAbiEvent<typeof abi, \\"AuctionCreated\\">;
      export type TokenEventEventKeyType = TokenEventEvent[\\"inputs\\"][number][\\"name\\"];
      export type TokenEventEventParamType = AbiParametersToPrimitiveTypes<TokenEventEvent[\\"inputs\\"]>;
      export type TokenEvent = SuperGraphEventType<{ [key in TokenEventEventKeyType]: TokenEventEventParamType[number] }>;
      "
    `);
  });
});
