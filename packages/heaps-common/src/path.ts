import path from "path";

export function getFullPath(filePath: string): string {
  return path.join(process.cwd(), filePath);
}

export function uncachedRequire(filePath: string): any {
  delete require.cache[require.resolve(filePath)];
  return require(filePath);
}
