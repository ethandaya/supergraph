import { beforeEach, describe, expect, it } from "vitest";
import os from "os";
import fs from "fs";
import { codegen } from "../src/commands/codegen/command";
import supergraph from "./stubs/supergraph.json";
import abi from "./stubs/abi.json";

describe("Codegen", () => {
  const tmpDir = os.tmpdir();

  beforeEach(() => {
    fs.writeFileSync(
      tmpDir + "/schema.graphql",
      `
        type Test @entity {
            id: ID!
            name: String!
        }
    `
    );
    const config = JSON.stringify(supergraph).replace(
      "ABI_PATH",
      `${tmpDir}/abi.json`
    );
    fs.writeFileSync(tmpDir + "/supergraph.json", config);
    fs.writeFileSync(tmpDir + "/abi.json", JSON.stringify(abi));
  });

  it("should correctly generate all artifacts for schema", async () => {
    await codegen({
      watch: false,
      pathToSchema: tmpDir + "/schema.graphql",
      pathToConfig: tmpDir + "/supergraph.json",
      outputDir: tmpDir,
    });

    expect(fs.existsSync(tmpDir + "/models.ts")).toBe(true);
    expect(fs.existsSync(tmpDir + "/schema.ts")).toBe(true);
    expect(
      fs.existsSync(
        tmpDir +
          `/${supergraph.sources[0].name}` +
          `/${supergraph.sources[0].name}.ts`
      )
    ).toBe(true);
  });
});
