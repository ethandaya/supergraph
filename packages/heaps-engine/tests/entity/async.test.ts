import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AsyncCrudEntity,
  AsyncStore,
  baseSchema,
  StoreType,
} from "../../src/core/entity";
import { z } from "zod";

const asyncTestSchema = baseSchema.extend({
  name: z.string(),
});

type AsyncTestModel = z.infer<typeof asyncTestSchema>;

class AsyncTestStore implements AsyncStore {
  type: StoreType = StoreType.ASYNC;
  data: Record<string, Record<string, any>> = {};
  set<T>(name: string, id: string, data: T): Promise<T> {
    console.log(`set ${name} ${id}`);
    this.data[name] = this.data[name] || {};
    this.data[name][id] = data;
    return Promise.resolve(this.data[name][id]);
  }
  get<T>(name: string, id: string): Promise<T> {
    console.log(`get ${name} ${id}`);
    this.data[name] = this.data[name] || {};
    return Promise.resolve(this.data[name][id]);
  }
}

describe("Entity", () => {
  let entity: AsyncCrudEntity<AsyncTestModel, typeof asyncTestSchema>;
  let testStore: AsyncTestStore;

  beforeEach(() => {
    vi.useFakeTimers();
    testStore = new AsyncTestStore();
    entity = new AsyncCrudEntity<AsyncTestModel, typeof asyncTestSchema>(
      "1",
      asyncTestSchema,
      testStore
    );
  });

  it("should be able to save an initial object with crud", async () => {
    entity._data = {
      name: "test",
    };
    await entity.save();
    const saved = await testStore.get<AsyncTestModel>("asynccrudentity", "1");
    expect(saved.name).toBe("test");
  });

  it("should be able to update an object with crud", async () => {
    entity._data = {
      name: "test",
    };
    await entity.save();
    const saved = await testStore.get<AsyncTestModel>("asynccrudentity", "1");
    expect(saved.name).toBe("test");
    entity._data = {
      ...entity._data,
      name: "test2",
    };
    vi.advanceTimersByTime(100);
    await entity.save();
    const saved2 = await testStore.get<AsyncTestModel>("asynccrudentity", "1");

    console.log(saved2, saved);

    expect(saved2.name).toBe("test2");
    expect(saved2.createdAt).toBe(saved.createdAt);
    expect(saved2.updatedAt).not.toBe(saved.updatedAt);
  });
});
