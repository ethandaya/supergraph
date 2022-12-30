import { BaseSchemaAdaptor, Column } from "./base";
import { DocumentNode } from "graphql/index";
import { ObjectTypeDefinitionNode } from "graphql/language";
import { EnumTypeDefinitionNode } from "graphql/language/ast";

export class PrismaAdaptor extends BaseSchemaAdaptor {
  constructor(ast: DocumentNode) {
    super({
      ast,
      schemaLookup: {
        ID: "Int @id",
        String: "String",
        Int: "Int",
        Float: "Float",
        Boolean: "Boolean",
        Date: "DateTime",
        BigInt: "Decimal",
        Bytes: "Bytes",
      },
      mapperLookup: {
        relation: () => "Int",
        array: (element: string) => `${element}[]`,
        notNull: (element: string) => element,
        enum: () => `TODO`,
        enumValue: (element: string) => element,
      },
    });
  }

  mapColumnToPrismaField(column: Column): string {
    let field = `${column.name}`;

    if (column.isRelation) {
      field += `${column.isArray ? "Ids" : "Id"}`;
    }

    field = `${field} ${column.type}`;

    if (column.isNullable) {
      field += "?";
    }

    if (column.isArray) {
      field = `${field}[]`;
    }

    if (column.isPrimaryKey) {
      field = `${field} @id`;
    }

    // if (column.isRelation) {
    //   field += ` @relation(name: "${column.name}")`;
    // }

    //
    // if (column.isEnum) {
    //   // You will need to specify the enum values in the field definition.
    //   field = `${field} @enum(values: [VALUE1, VALUE2, VALUE3])`;
    // }

    return field;
  }

  public mapObjectToPrismaModel(entity: ObjectTypeDefinitionNode): string {
    const fields = entity?.fields || [];
    const cols = this.mapFieldsToColumn(fields);
    const prismaFields = cols
      .filter((c) => c.type !== "TODO")
      .map((col) => this.mapColumnToPrismaField(col));
    return `
      model ${entity.name.value} {
        ${prismaFields.join("\n")}
      } \n\n
    `;
  }

  public mapEnumToPrismaModel(enumDef: EnumTypeDefinitionNode) {
    const values = enumDef.values?.map((v) => v.name.value) || [];
    return `enum ${enumDef.name.value} {\n${values.join("\n")}\n}`;
  }

  public mapSchemaToPrismaModel(): string {
    const models = this.getObjectTypes().map((d) =>
      this.mapObjectToPrismaModel(d as ObjectTypeDefinitionNode)
    );
    const enums = this.getEnumTypes().map((d) =>
      this.mapEnumToPrismaModel(d as EnumTypeDefinitionNode)
    );
    return [...enums, ...models].join("\n");
  }
}
