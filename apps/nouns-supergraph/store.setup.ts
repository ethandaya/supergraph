import * as fs from "fs";
import { store } from "./store";

export default async function () {
  const migrations = fs.readFileSync("./src/types/migrations.txt", "utf-8");
  console.log("Running migration script...");
  await store.sql.unsafe(migrations).execute();
  await store.sql.end();
  console.log("Finished running migration script.");
}
