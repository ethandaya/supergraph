import {
  DocumentNode,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
} from "graphql";
import { DefinitionNode, ObjectTypeDefinitionNode } from "graphql/language";
import { EnumTypeDefinitionNode, TypeNode } from "graphql/language/ast";
import { FieldDefinitionNode } from "graphql/index";

interface SchemaLookup {
  ID: string;
  String: string;
  Int: string;
  BigInt: string;
  Float: string;
  Boolean: string;
  Date: string;

  // ALTERNATE TYPES
  [key: string]: string;
}

interface MapperLookup {
  relation: (element: string) => string;
  array: (element: string) => string;
  notNull: (element: string) => string;
  enum: (values: string[]) => string;
  enumValue: (element: string) => string;
}

interface AdaptorConfig {
  ast: DocumentNode;
  schemaLookup: SchemaLookup;
  mapperLookup: MapperLookup;
}

export interface Column {
  name: string;
  type: string;
  isNullable?: boolean;
  isArray?: boolean;
  isRelation?: boolean;
  isEnum?: boolean;
  isPrimaryKey?: boolean;
}

export type UnamedColumn = Omit<Column, "name">;

export function isObjectTypeDefinition(
  shape: DefinitionNode
): shape is ObjectTypeDefinitionNode {
  return shape.kind === Kind.OBJECT_TYPE_DEFINITION;
}

export function isEnumTypeDefinition(
  shape: DefinitionNode
): shape is EnumTypeDefinitionNode {
  return shape.kind === Kind.ENUM_TYPE_DEFINITION;
}

export class BaseSchemaAdaptor {
  constructor(public readonly config: AdaptorConfig) {}

  public mapFieldsToColumn(fields: readonly FieldDefinitionNode[]) {
    return fields.map((field) => ({
      name: field.name.value,
      ...this.mapInputField(field.type),
    }));
  }

  public getObjectTypes(): ObjectTypeDefinitionNode[] {
    return this.config.ast.definitions.filter(isObjectTypeDefinition);
  }

  public getEnumTypes(): EnumTypeDefinitionNode[] {
    return this.config.ast.definitions.filter(isEnumTypeDefinition);
  }

  public getObjectNames() {
    return this.getObjectTypes().map((entity) => entity.name.value);
  }

  public mapInputField(type: TypeNode): UnamedColumn {
    switch (type.kind) {
      case Kind.NAMED_TYPE:
        return this.mapNamedType(type);
      case Kind.NON_NULL_TYPE:
        return this.mapNonNullType(type);
      case Kind.LIST_TYPE:
        return this.mapListType(type);
      default:
        return { type: "TODO" };
      // case Kind.ENUM_TYPE_DEFINITION:
      //   return this.mapEnumType(type);
      // case Kind.ENUM_VALUE_DEFINITION:
      // default:
      //   throw new Error(`Unsupported input type: ${type.kind}`);
    }
  }

  public mapNamedType(type: NamedTypeNode): UnamedColumn {
    switch (type.name.value) {
      case "ID":
      case "String":
      case "Int":
      case "Float":
      case "Boolean":
      case "Date":
      case "BigInt":
      case "Bytes":
        return {
          type: this.config.schemaLookup[type.name.value],
        };
      default:
        const customType = this.config.schemaLookup[type.name.value];
        if (customType) {
          return {
            type: customType,
          };
        }
        if (this.getObjectNames().includes(type.name.value)) {
          return {
            isRelation: true,
            type: this.config.mapperLookup.relation(type.name.value),
          };
        }
        return {
          type: "TODO",
        };
    }
  }

  public mapNonNullType(type: NonNullTypeNode): UnamedColumn {
    const nullableType = this.mapInputField(type.type);
    return {
      ...nullableType,
      isNullable: false,
    };
  }

  public mapListType(type: ListTypeNode): UnamedColumn {
    const elementType = this.mapInputField(type.type);
    return {
      isArray: true,
      ...elementType,
    };
  }

  //
  // public mapEnumType(type: EnumTypeDefinitionNode): string {
  //   if (!type.values) {
  //     throw new Error(`Enum ${type.name.value} has no values`);
  //   }
  //   const values = type.values.map(
  //     (value: EnumValueDefinitionNode) => value.name.value
  //   );
  //
  //   return this.config.mapperLookup.enum(values);
  // }
}
