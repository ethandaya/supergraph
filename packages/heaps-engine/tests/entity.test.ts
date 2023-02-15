import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  baseSchema,
  StoreType,
  SyncCrudEntity,
  SyncStore,
} from "../src/core/entity";
import { z } from "zod";

const testSchema = baseSchema.extend({
  name: z.string(),
});

type TestModel = z.infer<typeof testSchema>;

class TestStore implements SyncStore {
  type: StoreType = StoreType.SYNC;
  data: Record<string, Record<string, any>> = {};
  set<T>(name: string, id: string, data: T): T {
    console.log(`set ${name} ${id}`);
    this.data[name] = this.data[name] || {};
    this.data[name][id] = data;
    return this.data[name][id];
  }
  get<T>(name: string, id: string): T {
    console.log(`get ${name} ${id}`);
    this.data[name] = this.data[name] || {};
    return this.data[name][id];
  }
}

describe("Entity", () => {
  let entity: SyncCrudEntity<TestModel, typeof testSchema>;
  let testStore: TestStore;

  beforeEach(() => {
    vi.useFakeTimers();
    testStore = new TestStore();
    entity = new SyncCrudEntity<TestModel, typeof testSchema>(
      "1",
      testSchema,
      testStore
    );
  });

  it("should be able to save an initial object with crud", () => {
    entity._data = {
      name: "test",
    };
    entity.save();
    const saved = testStore.get<TestModel>("synccrudentity", "1");
    expect(saved.name).toBe("test");
  });

  it("should be able to update an object with crud", () => {
    entity._data = {
      name: "test",
    };
    entity.save();
    const saved = testStore.get<TestModel>("synccrudentity", "1");
    expect(saved.name).toBe("test");
    entity._data = {
      ...entity._data,
      name: "test2",
    };
    vi.advanceTimersByTime(100);
    entity.save();
    const saved2 = testStore.get<TestModel>("synccrudentity", "1");
    expect(saved2.name).toBe("test2");
    expect(saved2.createdAt).toBe(saved.createdAt);
    expect(saved2.updatedAt).not.toBe(saved.updatedAt);
  });

  it("should be able to use entity set method", () => {
    entity.set("name", "test");
    expect(entity._data.name).toBe("test");
  });

  it("should be able to use entity unset method", () => {
    entity.set("name", "test");
    expect(entity._data.name).toBe("test");
    entity.unset("name");
    expect(entity._data.name).toBe(null);
  });

  it("should be able to use entity get method", () => {
    entity.set("name", "test");
    expect(entity.get("name")).toBe("test");
  });
});
