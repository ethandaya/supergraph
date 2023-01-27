import { SQLiteStore } from "../../src";
import { z } from "zod";
import { expect } from "@jest/globals";

const testSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const secondTestSchema = z.object({
  id: z.string(),
  // TODO - new thought is user should respect allowed end store type
  isTest: z.number(),
  myNullableField: z.string().nullable(),
  myBigInt: z.bigint(),
});

describe("Store", () => {
  let store: SQLiteStore<"test" | "secondTest">;

  beforeEach(() => {
    store = new SQLiteStore({
      test: testSchema,
      secondTest: secondTestSchema,
    });
    store.db.exec(
      `CREATE TABLE IF NOT EXISTS test
             (
                 id        TEXT PRIMARY KEY,
                 name      TEXT,
                 updatedAt INTEGER,
                 createdAt INTEGER
             )`
    );
    store.db.exec(
      `CREATE TABLE IF NOT EXISTS secondTest
             (
                 id              TEXT PRIMARY KEY,
                 isTest          BOOLEAN,
                 myNullableField TEXT,
                 myBigInt        BIGINT,
                 updatedAt       INTEGER,
                 createdAt       INTEGER
             )`
    );
  });

  it("should be able to generate an insert statement for schema", () => {
    const insertStatement = store.getInsertStatementForModel(
      "test",
      testSchema
    );
    expect(insertStatement).toEqual(
      "INSERT INTO test (id, name, createdAt, updatedAt) VALUES ($id, $name, $createdAt, $updatedAt)"
    );
  });

  it("should be able to generate an update statement for schema", () => {
    const updateStatement = store.getUpdateStatementForModel(testSchema);
    expect(updateStatement).toEqual(
      "UPDATE SET name = $name, updatedAt = $updatedAt WHERE id = $id"
    );
  });

  it("should be able to generate a select statement for schema", () => {
    const selectStatement = store.getSelectStatementForModel("test");
    expect(selectStatement).toEqual(
      "SELECT * FROM test WHERE id = $id LIMIT 1"
    );
  });

  it("should be able to prepare statements for all models", () => {
    expect(store.stmts).toEqual({
      test: {
        insert: store.getInsertStatementForModel("test", testSchema),
        update: store.getUpdateStatementForModel(testSchema),
        select: store.getSelectStatementForModel("test"),
      },
      secondTest: {
        insert: store.getInsertStatementForModel(
          "secondTest",
          secondTestSchema
        ),
        update: store.getUpdateStatementForModel(secondTestSchema),
        select: store.getSelectStatementForModel("secondTest"),
      },
    });
  });

  it("should be able to set an entity", () => {
    const dto = store.set("test", "1", { name: "test" });

    const result = store.db
      .prepare("SELECT * FROM test WHERE id = '1' LIMIT 1")
      .get();

    expect(dto).toEqual(result);
  });

  it("should be able to get an entity", () => {
    store.set("test", "1", { name: "test" });
    const result = store.db
      .prepare("SELECT * FROM test WHERE id = '1' LIMIT 1")
      .get();
    const dto = store.get("test", "1");
    expect(dto).toEqual(result);
  });

  it("should be able to set an entity with a bigint", () => {
    store.set("secondTest", "1", {
      isTest: 1,
      myNullableField: null,
      myBigInt: 1152735103331642317n,
    });
    const res = store.get("secondTest", "1");
    expect(res.myBigInt).toEqual(1152735103331642317n);
  });
  //
  // it("should transform a stored entity to a dto", () => {
  //   let dto: StoredEntity<z.infer<typeof secondTestSchema>> = {
  //     id: "1",
  //     isTest: 1,
  //     myNullableField: null,
  //     myBigInt: BigInt(123456789),
  //   };
  //   dto = store.uncastEntity(secondTestSchema, dto);
  //   expect(dto).toEqual({
  //     id: "1",
  //     isTest: true,
  //     myNullableField: null,
  //     myBigInt: BigInt(123456789),
  //   });
  // });
  //
  // it("should transform an entity to a store safe dto", () => {
  //   const dto: z.infer<typeof secondTestSchema> = {
  //     id: "1",
  //     isTest: true,
  //     myNullableField: null,
  //     myBigInt: BigInt(123456789),
  //   };
  //   const storedDto = store.castEntity(secondTestSchema, dto);
  //   expect(storedDto).toEqual({
  //     id: "1",
  //     isTest: 1,
  //     myNullableField: null,
  //     myBigInt: BigInt(123456789),
  //   });
  // });
});
