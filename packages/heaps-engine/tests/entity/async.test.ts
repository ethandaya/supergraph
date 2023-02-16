import { beforeEach, describe, expect, it, vi } from "vitest";
import { AsyncCrudEntity, baseSchema } from "../../src/entity";
import { z } from "zod";
import { AsyncTestStore } from "../utils/store";

const asyncTestSchema = baseSchema.extend({
  name: z.string(),
});

type AsyncTestModel = z.infer<typeof asyncTestSchema>;

describe("Entity", () => {
  let entity: AsyncCrudEntity<
    "asynccrudentity",
    AsyncTestModel,
    typeof asyncTestSchema
  >;
  let testStore: AsyncTestStore<
    "asynccrudentity",
    {
      asynccrudentity: {
        type: z.infer<typeof asyncTestSchema>;
        schema: typeof asyncTestSchema;
      };
    }
  >;

  beforeEach(() => {
    vi.useFakeTimers();
    testStore = new AsyncTestStore();
    entity = new AsyncCrudEntity<
      "asynccrudentity",
      AsyncTestModel,
      typeof asyncTestSchema
    >("1", "asynccrudentity", asyncTestSchema, testStore);
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
