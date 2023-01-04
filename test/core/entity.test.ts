import { Entity, KeyAccessError, Store } from "../../src/core/engine";

class TestStore implements Store {
  set<T>(_: string, pk: string | number, value: T) {
    return Promise.resolve({
      id: pk,
      ...value,
    });
  }
}

const store = new TestStore();

interface PersonModel {
  name: string;
}
class Person extends Entity<PersonModel> {
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

  async save(): Promise<void> {
    if (!this.data.name) {
      throw new Error("Field name is missing");
    }
    const dto: PersonModel = {
      name: this.data.name,
    };
    await store.set<PersonModel>(this.constructor.name.valueOf(), this.pk, dto);
  }
}
describe("Entity", () => {
  let testEntity: Person;

  beforeEach(() => {
    testEntity = new Person(1);
  });

  it("should be able to set and get data on raw entity", () => {
    const entity = new Entity<{ name: string }>(1);
    entity.set("name", "John");
    expect(entity.get("name")).toEqual("John");
  });
  it("should be able to set implemented entity", () => {
    testEntity.name = "John";
    expect(testEntity.name).toEqual("John");
  });
  it("should fail to access getter before set", () => {
    expect(() => testEntity.name).toThrow(KeyAccessError);
  });

  it("should fail to save entity before fields set", () => {
    expect(testEntity.save()).rejects.toThrow("Field name is missing");
  });
});
