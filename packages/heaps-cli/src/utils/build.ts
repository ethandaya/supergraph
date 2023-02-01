import * as swc from "@swc/core";
import * as path from "path";
import * as fs from "fs";
import * as esbuild from "esbuild";

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
  fs.mkdirSync("./.heaps", { recursive: true });
  const buildPath = path.join(
    "./.heaps",
    path.basename(pathToSource, ".ts") + ".js"
  );
  const code = transformTS(pathToSource);
  fs.writeFileSync(buildPath, code);
  return buildPath;
}

export async function bundle(entryPath: string) {
  await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    outdir: "./.heaps",
    platform: "node",
    external: ["zod", "@heaps/engine"],
  });

  return path.join(
    "./.heaps",
    path.basename(entryPath, path.extname(entryPath)) + ".js"
  );
}
