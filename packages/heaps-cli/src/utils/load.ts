import fs from "fs";
import { SuperGraphConfig } from "../commands/codegen/types";

export function loadAndParseJSON<T>(pathToConfig: string): T {
  const resp = fs.readFileSync(pathToConfig, "utf-8");
  return JSON.parse(resp);
}

export function loadConfig(options: { pathToConfig: string }) {
  return loadAndParseJSON<SuperGraphConfig>(options.pathToConfig);
}
