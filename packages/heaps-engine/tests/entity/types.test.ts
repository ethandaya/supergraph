import { beforeEach, describe, expect, it } from "vitest";
import { AsyncCrudEntity, baseSchema } from "../../src/core/entity";
import { z } from "zod";
import { AsyncTestStore } from "../utils/store";

const asyncTestSchema = baseSchema.extend({
  name: z.string(),
  bigInt: z.bigint(),
});

type AsyncTestModel = z.infer<typeof asyncTestSchema>;

class TypedEntity extends AsyncCrudEntity<
  AsyncTestModel,
  typeof asyncTestSchema
> {
  get name(): AsyncTestModel["name"] {
    const d = this._data.name;
    if (d === undefined) {
      throw new Error("name is undefined");
    }
    return d;
  }

  set name(value: AsyncTestModel["name"]) {
    this._data.name = value;
  }

  get bigInt(): AsyncTestModel["bigInt"] {
    const d = this._data.bigInt;
    if (d === undefined) {
      throw new Error("bigInt is undefined");
    }
    return d;
  }

  set bigInt(value: AsyncTestModel["bigInt"]) {
    this._data.bigInt = value;
  }
}

describe("Entity", () => {
  let entity: TypedEntity;
  let testStore: AsyncTestStore;

  beforeEach(() => {
    testStore = new AsyncTestStore();
    entity = new TypedEntity("1", asyncTestSchema, testStore);
  });

  it("should be able to set and get a value", async () => {
    entity.name = "test";
    expect(entity.name).toBe("test");
  });

  it("should be able to set and get a bigint", async () => {
    entity.bigInt = BigInt(1);
    expect(entity.bigInt).toBe(BigInt(1));
  });
});
