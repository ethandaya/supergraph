import * as swc from "@swc/core";
import * as path from "path";
import * as fs from "fs";
import { getFullPath } from "@heaps/common/src";

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
      type: "nodenext",
    },
  });
  return module.code;
}

export function prepBuildDir() {
  const buildDir = getFullPath(".heaps");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }
}

export function build(pathToSource: string): string {
  prepBuildDir();
  const buildPath = path.join(
    ".heaps",
    path.basename(pathToSource, ".ts") + ".js"
  );
  const code = transformTS(pathToSource);
  fs.writeFileSync(buildPath, code);
  return buildPath;
}
