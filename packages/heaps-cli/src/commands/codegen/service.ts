import * as swc from "@swc/core";
import * as path from "path";
import * as fs from "fs";
import os from "os";

// TODO - this is bad, fix later
export function transformTS(path: string) {
  const module = swc.transformFileSync(path, {
    jsc: {
      target: "es2022",
      parser: {
        syntax: "typescript",
      },
    },
    module: {
      type: "commonjs",
    },
  });
  return module.code;
}

export function build(pathToSource: string): string {
  const buildPath = path.join(
    os.tmpdir(),
    path.basename(pathToSource, ".ts") + ".js"
  );
  const code = transformTS(pathToSource);
  fs.writeFileSync(buildPath, code);
  return buildPath;
}
