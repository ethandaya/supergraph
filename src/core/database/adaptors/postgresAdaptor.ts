import { BaseSchemaAdaptor, Column } from "./base";
import { ObjectTypeDefinitionNode } from "graphql/language";
import { DocumentNode } from "graphql/index";

export class PostgresAdaptor extends BaseSchemaAdaptor {
  constructor(ast: DocumentNode) {
    super({
      ast,
      schemaLookup: {
        ID: "INTEGER",
        String: "VARCHAR(255)",
        Int: "INTEGER",
        Float: "FLOAT",
        Boolean: "BOOLEAN",
        Date: "DATE",
        BigInt: "NUMERIC(75, 0)",
        Bytes: "BYTEA",
      },
      mapperLookup: {
        relation: () => "INTEGER",
        array: (element: string) => `${element}[]`,
        notNull: (element: string) => `${element} NOT NULL`,
        enum: (values: string[]) => `ENUM(${values.join(", ")})`,
        enumValue: (element: string) => `'${element}'`,
      },
    });
  }

  // private registerEntityNames() {
  //   const objectTypes = this.config.ast.definitions.filter(
  //     isObjectTypeDefinition
  //   );
  //   const columns = objectTypes.reduce((acc, entity) => {
  //     const col = `KEY ${entity.name.value} (${entity.name.value}_id)`;
  //     return { ...acc, [entity.name.value]: fields };
  //   }, {});
  // }

  private mapColumnToSql(column: Column): string {
    if (column.isRelation) {
      return `${column.name}${column.isArray ? "_ids" : "_id"} ${column.type}`;
    }

    let field = `${column.name} ${column.type}`;
    //
    //
    if (!column.isNullable && !column.isRelation) {
      field += " NOT NULL";
    }
    //
    // if (column.isArray) {
    //   field = `${field}[]`;
    // }
    //
    // if (column.isPrimaryKey) {
    //   field = `${field} @id`;
    // }
    //
    // if (column.isRelation) {
    //   field += ` @relation(name: "${column.name}")`;
    // }
    //
    // //
    // // if (column.isEnum) {
    // //   // You will need to specify the enum values in the field definition.
    // //   field = `${field} @enum(values: [VALUE1, VALUE2, VALUE3])`;
    // // }

    return field;
  }

  public mapColumnsToKeys(columns: Column[]): string[] {
    const relations = columns
      .filter((column) => column.isRelation && !column.isArray)
      .map((column) => `KEY ${column.name}_id_idx (${column.name}_id)`);
    const primary = `PRIMARY KEY (id)`;
    return [...relations, primary];
  }

  public objectToTable(entity: ObjectTypeDefinitionNode): string {
    const fields = entity?.fields || [];
    const columns = this.mapFieldsToColumn(fields)
      .filter((r) => r.type !== "TODO")
      .map(this.mapColumnToSql);
    return `CREATE TABLE ${entity.name.value}
                (
                    ${columns.join(",")}
                );`;
  }
}
