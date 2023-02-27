import { beforeEach, describe, expect, it, vi } from "vitest";
import { baseSchema, CrudEntity } from "../../src";
import { z } from "zod";
import { TestStore } from "../utils/store";

const testSchema = baseSchema.extend({
  name: z.string(),
});

const testSchema2 = baseSchema.extend({
  name: z.string(),
  age: z.number(),
});

type TestModel = z.infer<typeof testSchema>;

const testStore = new TestStore<{
  synccrudentity: {
    type: z.infer<typeof testSchema>;
    schema: typeof testSchema;
  };
  synccrudentity2: {
    type: z.infer<typeof testSchema2>;
    schema: typeof testSchema2;
  };
}>();

class TestEntity extends CrudEntity<
  "synccrudentity",
  TestModel,
  typeof testSchema
> {
  constructor(id: string, data?: TestModel) {
    super(id, "synccrudentity", testSchema);
    this._data = { id, ...data } || { id };
  }

  static load(id: string): TestEntity | null {
    const data = testStore.get("synccrudentity", id);
    if (!data) {
      return new TestEntity(id);
    }

    return new TestEntity(id, data);
  }

  save() {
    const dto = this._schema
      .extend({
        updatedAt: z.bigint().optional(),
        createdAt: z.bigint().optional(),
      })
      .parse({ id: this._id, ...this._data });
    this._data = testStore.set("synccrudentity", this._id, dto);
    return this._data;
  }
}

describe("Entity", () => {
  let entity: TestEntity;

  beforeEach(() => {
    vi.useFakeTimers();
    entity = new TestEntity("1");
    testStore.data = {};
  });

  it("should be able to save an initial object with crud", () => {
    entity.set("name", "test");
    entity.save();
    const saved = testStore.get("synccrudentity", "1");
    expect(saved.name).toBe("test");
  });

  it("should be able to update an object with crud", () => {
    entity.set("name", "test");
    entity.save();
    const saved = testStore.get("synccrudentity", "1");
    expect(saved.name).toBe("test");
    entity.set("name", "test2");
    vi.advanceTimersByTime(100);
    entity.save();
    const saved2 = testStore.get("synccrudentity", "1");
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
