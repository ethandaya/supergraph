import fetch from "cross-fetch";
import { Store } from "./core/engine";
import { connect, Connection } from "@planetscale/database";

class PlanetscaleStore implements Store {
  conn: Connection;

  constructor() {
    this.conn = connect({
      fetch,
      username: "mpra1n6udmhkjwsnslfg",
      host: "us-east.connect.psdb.cloud",
      password: "pscale_pw_DK5OCPjvXn6KUxr2wF2is7NCp9y3hNp1M4m4GI2oHAm",
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
