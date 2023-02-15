import { beforeEach, describe, it } from "vitest";
import { CrudData, SyncStore } from "../../src/core/store";
import { StoreType } from "../../src/core/entity";
import { z } from "zod";

export type ModelLookup<T extends string> = {
  [key in T]: z.infer<z.AnyZodObject>;
};

class SqliteStore<
  T extends string,
  J extends ModelLookup<T>,
  K extends keyof J = keyof J
> implements SyncStore<T, J, K>
{
  type = StoreType.SYNC;

  get(entity: K, id: string | number): CrudData<J[K]> | null {
    console.log(entity, id);
    return null;
  }
  set(entity: K, id: string | number, data: J[K]): CrudData<J[K]> {
    console.log(entity, id, data);
    const dto = {
      id,
      ...data,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };
    return dto;
  }
}

const testSchema = z.object({
  name: z.string(),
});

describe("Entity", () => {
  let sqliteStore: SqliteStore<"test", { test: z.infer<typeof testSchema> }>;

  beforeEach(() => {
    sqliteStore = new SqliteStore();
  });

  it("should be able to create a new entity", () => {
    sqliteStore.set("test", "1", { name: "John" });
  });
});
