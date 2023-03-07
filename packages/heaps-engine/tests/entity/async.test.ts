import { beforeEach, describe, expect, it, vi } from "vitest";
import { baseSchema, CrudEntity } from "../../src";
import { z } from "zod";
import { AsyncTestStore } from "../utils/store";

const asyncTestSchema = baseSchema.extend({
  name: z.string(),
});

type AsyncTestModel = z.infer<typeof asyncTestSchema>;

const testStore = new AsyncTestStore<
  "asynccrudentity",
  {
    asynccrudentity: typeof asyncTestSchema;
  }
>({
  asynccrudentity: asyncTestSchema,
});

class TestAsyncEntity extends CrudEntity<
  "asynccrudentity",
  AsyncTestModel,
  typeof asyncTestSchema
> {
  constructor(id: string, data?: AsyncTestModel) {
    super(id, "asynccrudentity", asyncTestSchema);
    this._data = { id, ...data } || { id };
  }

  static async load(id: string): Promise<TestAsyncEntity | null> {
    const data = await testStore.get("asynccrudentity", id);
    if (!data) {
      return new TestAsyncEntity(id);
    }

    return new TestAsyncEntity(id, data);
  }

  async save() {
    const dto = this._schema
      .extend({
        updatedAt: z.bigint().optional(),
        createdAt: z.bigint().optional(),
      })
      .parse({ id: this._id, ...this._data });
    this._data = await testStore.set("asynccrudentity", this._id, dto);
    return this._data;
  }
}

describe("Entity", () => {
  let entity: TestAsyncEntity;

  beforeEach(() => {
    vi.useFakeTimers();
    entity = new TestAsyncEntity("1");
    testStore.data = {};
  });

  it("should be able to save an initial object with crud", async () => {
    entity._data = {
      name: "test",
    };
    await entity.save();
    const saved = await testStore.get("asynccrudentity", "1");
    expect(saved.name).toBe("test");
  });

  it("should be able to update an object with crud", async () => {
    entity._data = {
      name: "test",
    };
    await entity.save();
    const saved = await testStore.get("asynccrudentity", "1");
    expect(saved.name).toBe("test");
    entity._data = {
      ...entity._data,
      name: "test2",
    };
    vi.advanceTimersByTime(100);
    await entity.save();
    const saved2 = await testStore.get("asynccrudentity", "1");
    expect(saved2.name).toBe("test2");
    expect(saved2.createdAt).toBe(saved.createdAt);
    expect(saved2.updatedAt).not.toBe(saved.updatedAt);
  });
});
