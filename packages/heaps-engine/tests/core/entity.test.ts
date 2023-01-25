import { Entity, KeyAccessError } from "../../src";
import { z, ZodError } from "zod";
import { SQLiteStore } from "../../src";

const PersonSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const store = new SQLiteStore("", {
  person: PersonSchema,
});

type PersonModel = z.infer<typeof PersonSchema>;

class Person extends Entity<PersonModel, typeof PersonSchema> {
  constructor(id: string) {
    super(id, PersonSchema, store);
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

  beforeAll(() => {
    store.db.exec(
      `CREATE TABLE IF NOT EXISTS person
             (
                 id        TEXT PRIMARY KEY,
                 name      TEXT,
                 updatedAt INTEGER,
                 createdAt INTEGER
             )`
    );
  });

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
    expect(testEntity.name).toEqual("John");
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
      updatedAt: expect.any(BigInt),
      createdAt: expect.any(BigInt),
    });
  });
});
