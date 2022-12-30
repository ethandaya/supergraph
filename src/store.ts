import { Store } from "./core/engine";
import { Connection, connect } from "@planetscale/database/dist";

class PlanetscaleStore implements Store {
  conn: Connection;

  constructor() {
    this.conn = connect({
      fetch,
      username: "wydfrhewbd1dhsa7993q",
      host: "aws.connect.psdb.cloud",
      password: "pscale_pw_Or4LlF6M1DVNwwsVgAKGoKY4NWQ9xtSciK58tUG1znt",
    });
  }

  private getInsertStatement(entity: string, pk: string | number, data: any) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    return `INSERT INTO ${entity} (id, ${keys.join(
      ","
    )}) VALUES (${pk},${values.join(",")});`;
  }

  async set<T extends {}>(entity: string, pk: string | number, data: T) {
    await this.conn.execute(this.getInsertStatement(entity, pk, data));
  }
}
export const store = new PlanetscaleStore();
