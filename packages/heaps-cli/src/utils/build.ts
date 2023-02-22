import * as path from "path";
import * as esbuild from "esbuild";

// TODO - this is bad, fix later

export async function bundle(entryPath: string) {
  await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    outdir: "./.heaps",
    platform: "node",
    external: ["zod", "@heaps/engine"],
    target: ["esnext"],
  });

  return path.join(
    "./.heaps",
    path.basename(entryPath, path.extname(entryPath)) + ".js"
  );
}
