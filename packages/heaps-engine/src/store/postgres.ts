import postgres from "postgres";
import { StoreType } from "../entity";
import { z } from "zod";
import { ModelLookup } from "./common";
import { AsyncStore, BaseStore, CrudDto } from "../store";

export class PostgresStore<
    H extends string,
    E extends ModelLookup<H> = ModelLookup<H>,
    A extends keyof E = keyof E
  >
  extends BaseStore<E, A>
  implements AsyncStore<E, A>
{
  type = StoreType.ASYNC;
  public sql: postgres.Sql;

  constructor(public readonly models: E) {
    super(models);
    this.sql = postgres(process.env.STORE_URL || "", {
      types: {
        bigint: postgres.BigInt,
      },
      // transform: postgres.toCamel,
    });
  }

  async get<J extends A = A>(
    entity: J,
    id: string
  ): Promise<z.infer<E[J]> | null> {
    const model: E[J] = this.models[entity];
    const [row] = await this.sql`SELECT * FROM ${this.sql(
      String(entity)
    )} WHERE id = ${id}`.execute();
    if (!row) {
      return null;
    }
    return model.parse(row);
  }

  async set<J extends A = A>(
    entity: J,
    id: string,
    data: CrudDto<z.infer<E[J]>>
  ): Promise<z.infer<E[J]>> {
    const model: E[J] = this.models[entity];
    const dto: z.infer<E[J]> = model.parse(
      this.prepForSave({
        id,
        ...data,
      })
    );
    const [row] = await this.sql`INSERT INTO ${this.sql(
      String(entity)
    )} ${this.sql(
      this.serialize<J>(entity, dto)
    )} ON CONFLICT (id) DO UPDATE SET ${this.sql(
      this.serialize<J>(entity, dto, true)
    )} WHERE ${this.sql(String(entity))}.id = ${id} RETURNING *`.execute();
    return model.parse(row);
  }
}
