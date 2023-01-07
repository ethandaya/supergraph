import {
  CrudEntity,
  Entity,
  KeyAccessError,
  Store,
} from "../../src/core/engine";
import { z, ZodError } from "zod";

class TestStore implements Store {
  repo: Record<string, any> = {};
  async set<T>(
    name: string,
    pk: string | number,
    value: T
  ): Promise<CrudEntity<T>> {
    const dto = {
      id: pk,
      ...value,
      updatedAt: Date.now(),
      ...(!this.repo?.[name]?.[pk]
        ? {
            createdAt: Date.now(),
          }
        : {
            createdAt: this.repo[name][pk].createdAt,
          }),
    };
    this.repo = {
      [name]: {
        ...(this.repo?.[name] || {}),
        [dto.id]: {
          ...dto,
        },
      },
    };
    return this.repo[name][dto.id];
  }
}

const store = new TestStore();

const schema = z.object({
  id: z.number(),
  name: z.string(),
});
type PersonModel = z.infer<typeof schema>;
class Person extends Entity<PersonModel> {
  constructor(id: number) {
    super(id, schema, store);
  }

  get name(): string {
    const value = this.get("name");
    if (!value) {
      throw new KeyAccessError<PersonModel>("name");
    }
    return value;
  }

  set name(value: string) {
    this.set("name", value);
  }
}
describe("Entity", () => {
  const testEntity: Person;

  beforeEach(() => {
    testEntity = new Person(1);
  });
  // it("should be able to set and get data on raw entity", () => {
  //   const entity = new Entity<{ name: string }>(1);
  //   entity.set("name", "John");
  //   expect(entity.get("name")).toEqual("John");
  // });
  it("should be able to set implemented entity", () => {
    testEntity.name = "John";
    expect(testEntity.name).toEqual("John");
  });
  it("should fail to access getter before set", () => {
    expect(() => testEntity.name).toThrow(KeyAccessError);
  });
  it("should fail to save entity before fields set", () => {
    expect(testEntity.save()).rejects.toThrowError(ZodError);
  });
  it("should be able to save entity after fields set", () => {
    testEntity.name = "John";
    expect(testEntity.save()).resolves.toEqual({
      id: 1,
      name: "John",
      updatedAt: expect.any(Number),
      createdAt: expect.any(Number),
    });
  });
});
