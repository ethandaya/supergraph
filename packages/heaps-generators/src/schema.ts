import {
  EnumTypeDefinitionNode,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
} from "graphql/language";
import { DocumentNode } from "graphql";
import {
  isDerivedField,
  isEnumTypeDefinition,
  isObjectTypeDefinition,
  UnamedColumn,
} from "./common";
import { FieldDefinitionNode } from "graphql/index";

type SchemaTypes =
  | "String"
  | "Bytes"
  | "Number"
  | "Boolean"
  | "BigInt"
  | "Date"
  | "Enum";

export type PrimitiveLookup = {
  [key in SchemaTypes]:
    | ((val: NamedTypeNode, field: FieldDefinitionNode) => string)
    | string;
};

export class SchemaHandler {
  schemaLookup: PrimitiveLookup;
  schema: DocumentNode;
  constructor(schema: DocumentNode, primitiveLookup: PrimitiveLookup) {
    this.schemaLookup = primitiveLookup;
    this.schema = schema;
  }

  public mapFieldsToColumn(fields: readonly FieldDefinitionNode[]) {
    return fields
      .filter((field) => !isDerivedField(field.directives))
      .map((field) => ({
        name: field.name.value,
        isNullable: true,
        ...this.mapInputField(field.type, field),
      }));
  }

  public getObjectTypes(): ObjectTypeDefinitionNode[] {
    return this.schema.definitions.filter(isObjectTypeDefinition);
  }

  public getEnumTypes(): EnumTypeDefinitionNode[] {
    return this.schema.definitions.filter(isEnumTypeDefinition);
  }

  public getObjectNames() {
    return this.getObjectTypes().map((entity) => entity.name.value);
  }

  mapInputField(
    type: NamedTypeNode | ListTypeNode | NonNullTypeNode,
    field: FieldDefinitionNode
  ): UnamedColumn {
    switch (type.kind) {
      case Kind.NAMED_TYPE:
        return this.mapNamedType(type, field);
      case Kind.LIST_TYPE:
        return this.mapListType(type, field);
      case Kind.NON_NULL_TYPE:
        return this.mapNonNullType(type, field);
      default:
        throw new Error("Unknown type");
    }
  }

  mapNamedType(type: NamedTypeNode, field: FieldDefinitionNode): UnamedColumn {
    switch (type.name.value) {
      case "ID":
        return {
          type: this.mapNamedTypeValue("String", type, field),
          isPrimaryKey: true,
        };
      case "String":
        return {
          type: this.mapNamedTypeValue("String", type, field),
        };
      case "Int":
      case "Float":
        return {
          type: this.mapNamedTypeValue("Number", type, field),
        };
      case "Boolean":
        return {
          type: this.mapNamedTypeValue("Boolean", type, field),
        };
      case "Date":
        return {
          type: this.mapNamedTypeValue("Date", type, field),
        };
      case "BigInt":
        return {
          type: this.mapNamedTypeValue("BigInt", type, field),
        };
      default:
        if (this.getObjectNames().includes(type.name.value)) {
          return {
            type: this.mapNamedTypeValue("String", type, field),
            isRelation: true,
          };
        }
        if (
          this.getEnumTypes()
            .map((enumType) => enumType.name.value)
            .includes(type.name.value)
        ) {
          return {
            type: this.mapNamedTypeValue("Enum", type, field),
            isEnum: true,
          };
        }
        return {
          type: this.mapNamedTypeValue("String", type, field),
        };
    }
  }

  public mapNonNullType(
    type: NonNullTypeNode,
    field: FieldDefinitionNode
  ): UnamedColumn {
    const nullableType = this.mapInputField(type.type, field);
    return {
      ...nullableType,
      isNullable: false,
    };
  }

  public mapListType(
    type: ListTypeNode,
    field: FieldDefinitionNode
  ): UnamedColumn {
    const elementType = this.mapInputField(type.type, field);
    return {
      isArray: true,
      ...elementType,
    };
  }

  mapNamedTypeValue(
    type: SchemaTypes,
    val: NamedTypeNode,
    field: FieldDefinitionNode
  ): string {
    const restMappers = this.schemaLookup;
    const mapperFunction = restMappers[type];
    if (!mapperFunction) {
      throw new Error(`Unsupported mapper: ${type}`);
    }
    if (typeof mapperFunction === "string") {
      return mapperFunction;
    }
    return mapperFunction(val, field);
  }
}
