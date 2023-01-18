import { codegen } from "../src/commands/codegen";
import { getFullPath } from "@heaps/common";
import os from "os";
import * as fs from "fs";

describe("Commands", () => {
  it("should lol", async () => {
    const outputPath = `${os.tmpdir()}/mySchemaFile.ts`;
    await codegen({
      pathToModels: getFullPath("./tests/stubs/models.ts"),
      outputPath,
    });
    const file = fs.readFileSync(outputPath, "utf-8");
    expect(file).toMatchSnapshot();
  });
});
