import { BaseSchemaAdaptor, Column } from "./base";
import { DocumentNode } from "graphql/index";

export class ClickhouseAdaptor extends BaseSchemaAdaptor {
  constructor(ast: DocumentNode) {
    super({
      ast,
      schemaLookup: {
        ID: "INTEGER",
        String: "STRING",
        Int: "INTEGER",
        Float: "FLOAT",
        Boolean: "BOOLEAN",
        Date: "DATETIME",
        BigInt: "UINT256",
        Bytes: "FixedString",
      },
      mapperLookup: {
        relation: (element: string) => element,
        array: (element: string) => `ARRAY(${element})`,
        notNull: (element: string) => element,
        enum: (values: string[]) => values.join(","),
        enumValue: (element: string) => element,
      },
    });
  }

  mapColumnToClickhouseField(column: Column): string {
    let field = `${column.name}`;

    if (column.isRelation) {
      field += `${column.isArray ? "Ids" : "Id"}`;
    }

    if (column.isArray) {
      field = `${field} ARRAY(${column.type})`;
    } else {
      field = `${field} ${column.type}`;
    }

    if (!column.isNullable) {
      field += " NOT NULL";
    }

    //
    // if (column.isPrimaryKey) {
    //   field = `${field} @id`;
    // }

    return field;
  }
}
