import { Entity, KeyAccessError } from "../../src/core/engine";

type PersonModel = { name: string };
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
}
describe("Entity", () => {
  let testEntity: Person;

  beforeEach(() => {
    testEntity = new Person(1);
  });

  it("should be able to set and get data", () => {
    const entity = new Entity(1);
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
});
