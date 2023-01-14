import path from "path";

export function getFullPath(filePath: string): string {
  return path.join(process.cwd(), filePath);
}
