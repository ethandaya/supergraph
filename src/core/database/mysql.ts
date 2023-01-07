import {
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
} from "graphql";

export function createTable(typeDef: ObjectTypeDefinitionNode): string {
  const statement = `CREATE TABLE ${typeDef.name.value} (`;

  const fields = typeDef.fields || [];

  if (!fields.length) {
    throw new Error(`Entity ${typeDef.name.value} has no fields`);
  }

  fields.forEach((field: FieldDefinitionNode) => {
    statement += `  ${field.name.value} `;

    // Determine the field type and add it to the statement
    switch (true) {
      case field.type.kind === "NamedType":
        statement += mapNamedType(field.type as NamedTypeNode);
        break;
      case field.type.kind === "ListType":
        statement += mapListType(field.type as ListTypeNode);
        break;
      case field.type.kind === "NonNullType":
        statement += mapNonNullType(field.type as NonNullTypeNode);
        break;
      default:
        throw new Error(`Unsupported field type: ${field.type.kind}`);
    }

    statement += ",";
  });

  // Add the primary key column
  statement += "  PRIMARY KEY (id)";

  // Close the CREATE TABLE statement
  statement += ");";

  return statement;
}

function mapNamedType(type: NamedTypeNode): string {
  switch (type.name.value) {
    case "ID":
      return "SERIAL";
    case "String":
      return "VARCHAR(255)";
    case "Int":
      return "INTEGER";
    case "Float":
      return "REAL";
    case "Boolean":
      return "BOOLEAN";
    case "Date":
      return "DATE";
    case "BigInt":
      return "BIGINT";
    default:
      throw new Error(`Unsupported named type: ${type.name.value}`);
  }
}

function mapInputType(
  type:
    | NamedTypeNode
    | ListTypeNode
    | NonNullTypeNode
    | EnumTypeDefinitionNode
    | EnumValueDefinitionNode
): string {
  switch (true) {
    case type.kind === "NamedType":
      return mapNamedType(type as NamedTypeNode);
    case type.kind === "ListType":
      return mapListType(type as ListTypeNode);
    case type.kind === "NonNullType":
      return mapNonNullType(type as NonNullTypeNode);
    case type.kind === "EnumTypeDefinition":
      return mapEnumType(type as EnumTypeDefinitionNode);
    case type.kind === "EnumValueDefinition":
      return mapEnumValue(type as EnumValueDefinitionNode);
    // case type.kind === "InputObjectTypeDefinition":
    //   return mapInputObjectType(type);
    default:
      throw new Error(`Unsupported input type: ${type.kind}`);
  }
}

function mapListType(type: ListTypeNode): string {
  // Convert the list element type to a string
  const elementType = mapInputType(type.type);

  // Return the element type as an array
  return `${elementType}[]`;
}

function mapNonNullType(type: NonNullTypeNode): string {
  // Convert the non-null type to a string
  const nullabconstype = mapInputType(type.type);

  // Return the non-null type as NOT NULL
  return `${nullabconstype} NOT NULL`;
}

function mapEnumType(type: EnumTypeDefinitionNode): string {
  if (!type.values) {
    throw new Error(`Enum ${type.name.value} has no values`);
  }
  // Convert the enum values to a string array
  const values = type.values.map((value: EnumValueDefinitionNode) => {
    return `'${value.name.value}'`;
  });

  // Return the enum values as a string with the ENUM type
  return `ENUM(${values.join(", ")})`;
}

function mapEnumValue(type: EnumValueDefinitionNode): string {
  return `'${type.name.value}'`;
}
