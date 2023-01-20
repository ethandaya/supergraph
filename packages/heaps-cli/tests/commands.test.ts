import { codegen } from "../src/commands/codegen/command";
import { getFullPath } from "@heaps/common";
import * as fs from "fs";

describe("Commands", () => {
  it("should be able to codegen model entities", async () => {
    const outputPath = `./.heaps/test-schema.ts`;
    await codegen({
      pathToModels: getFullPath("./tests/stubs/models.ts"),
      outputPath,
    });
    const file = fs.readFileSync(outputPath, "utf-8");
    expect(file).toMatchSnapshot();
  });
});
