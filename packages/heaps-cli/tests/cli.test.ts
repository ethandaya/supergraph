import { beforeAll, describe, expect, it } from "vitest";
import { execa } from "execa";

function run(args: string[]) {
  return execa("node", ["./dist/cli-default.js", ...args]);
}

describe("CLI", () => {
  beforeAll(async () => {
    await execa("pnpm", ["run", "build"]);
  });

  it("should run get correct version for heaps-cli", async () => {
    const result = await run(["--version"]);
    expect(result.stdout).toBe("heaps/0.0.1 darwin-arm64 node-v16.15.1");
  });

  it("should be able to run matched command", async () => {
    const result = await run(["hello"]);
    expect(result.stdout).toBe("world");
  });
});
