import {
  CrudEntity,
  Entity,
  KeyAccessError,
  Store,
} from "../../src/core/engine";
import { z, ZodError } from "zod";

class TestStore implements Store {
  repo: Record<string, any> = {};
  set<T>(name: string, pk: string | number, value: T): CrudEntity<T> {
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
  id: z.string(),
  name: z.string(),
});
type PersonModel = z.infer<typeof schema>;
class Person extends Entity<PersonModel> {
  constructor(id: string) {
    super(id, schema, store);
  }

  get name(): PersonModel["name"] {
    const value = this.get("name");
    if (!value) {
      throw new KeyAccessError<PersonModel>("name");
    }
    return value;
  }

  set name(value: PersonModel["name"]) {
    this.set("name", value);
  }
}
describe("Entity", () => {
  let testEntity: Person;

  beforeEach(() => {
    testEntity = new Person("1");
  });
  // it("should be able to set and get data on raw entity", () => {
  //   const entity = new Entity<{ name: string }>(1);
  //   entity.set("name", "John");
  //   expect(entity.get("name")).toEqual("John");
  // });
  it("should be able to set implemented entity", () => {
    testEntity.name = "John";
    expect(() => testEntity.name).toEqual("John");
  });
  it("should fail to access getter before set", () => {
    expect(() => testEntity.name).toThrowError(KeyAccessError);
  });
  it("should fail to save entity before fields set", () => {
    expect(() => testEntity.save()).toThrowError(ZodError);
  });
  it("should be able to save entity after fields set", () => {
    testEntity.name = "John";
    const dto = testEntity.save();
    expect(dto).toEqual({
      id: "1",
      name: "John",
      updatedAt: expect.any(Number),
      createdAt: expect.any(Number),
    });
  });
});
