import { SQLiteStore, StoredEntity } from "../../src/core/store";
import { z } from "zod";

const testSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const secondTestSchema = z.object({
  id: z.string(),
  isTest: z.boolean(),
  myNullableField: z.string().nullable(),
  myBigInt: z.bigint(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

describe("Store", () => {
  let store: SQLiteStore<"test" | "secondTest">;

  beforeEach(() => {
    store = new SQLiteStore("", {
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
                 isTest          INTEGER,
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
    const updateStatement = store.getUpdateStatementForModel(
      "test",
      testSchema
    );
    expect(updateStatement).toEqual(
      "UPDATE test SET name = $name, updatedAt = $updatedAt WHERE id = $id"
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
        update: store.getUpdateStatementForModel("test", testSchema),
        select: store.getSelectStatementForModel("test"),
      },
      secondTest: {
        insert: store.getInsertStatementForModel(
          "secondTest",
          secondTestSchema
        ),
        update: store.getUpdateStatementForModel(
          "secondTest",
          secondTestSchema
        ),
        select: store.getSelectStatementForModel("secondTest"),
      },
    });
  });

  it("should be able to set an entity", () => {
    const dto = store.set("test", "1", { name: "test" });

    const createdAt = dto.createdAt;
    const updatedAt = dto.updatedAt;

    const result = store.db
      .prepare("SELECT * FROM test WHERE id = '1' LIMIT 1")
      .get();

    expect(dto).toEqual(result);

    expect(createdAt).toBeLessThanOrEqual(Date.now());
    expect(updatedAt).toBeLessThanOrEqual(Date.now());
  });

  it("should be able to get an entity", () => {
    store.set("test", "1", { name: "test" });
    const result = store.db
      .prepare("SELECT * FROM test WHERE id = '1' LIMIT 1")
      .get();
    const dto = store.get("test", "1");
    expect(dto).toEqual(result);
  });

  it("should transform a stored entity to a dto", () => {
    const now = Date.now();
    let dto: StoredEntity<z.infer<typeof secondTestSchema>> = {
      id: "1",
      isTest: 1,
      myNullableField: null,
      myBigInt: BigInt(123456789),
      createdAt: now,
      updatedAt: now,
    };
    dto = store.uncastEntity(secondTestSchema, dto);
    expect(dto).toEqual({
      id: "1",
      isTest: true,
      myNullableField: null,
      myBigInt: BigInt(123456789),
      createdAt: now,
      updatedAt: now,
    });
  });

  it("should transform an entity to a store safe dto", () => {
    const now = Date.now();
    const dto: z.infer<typeof secondTestSchema> = {
      id: "1",
      isTest: true,
      myNullableField: null,
      myBigInt: BigInt(123456789),
      createdAt: now,
      updatedAt: now,
    };
    const storedDto = store.castEntity(secondTestSchema, dto);
    expect(storedDto).toEqual({
      id: "1",
      isTest: 1,
      myNullableField: null,
      myBigInt: BigInt(123456789),
      createdAt: now,
      updatedAt: now,
    });
  });
});
