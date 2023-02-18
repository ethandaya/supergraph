import {
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
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
  [key in SchemaTypes]: ((val: SchemaTypes) => string) | string;
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
        ...this.mapInputField(field.type),
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
    type:
      | NamedTypeNode
      | ListTypeNode
      | NonNullTypeNode
      | EnumTypeDefinitionNode
      | EnumValueDefinitionNode
  ): UnamedColumn {
    switch (type.kind) {
      case Kind.NAMED_TYPE:
        return this.mapNamedType(type);
      case Kind.LIST_TYPE:
        return this.mapListType(type);
      case Kind.NON_NULL_TYPE:
        return this.mapNonNullType(type);
      case Kind.ENUM_TYPE_DEFINITION:
        return this.mapEnumType(type);
      case Kind.ENUM_VALUE_DEFINITION:
        return this.mapEnumValue(type);
      default:
        throw new Error("Unknown type");
    }
  }

  mapNamedType(type: NamedTypeNode): UnamedColumn {
    switch (type.name.value) {
      case "ID":
      case "String":
        return {
          type: this.mapNamedTypeValue("String", type.name.value),
        };
      case "Int":
      case "Float":
        return {
          type: this.mapNamedTypeValue("Number", type.name.value),
        };
      case "Boolean":
        return {
          type: this.mapNamedTypeValue("Boolean", type.name.value),
        };
      case "Date":
        return {
          type: this.mapNamedTypeValue("Date", type.name.value),
        };
      case "BigInt":
        return {
          type: this.mapNamedTypeValue("BigInt", type.name.value),
        };
      default:
        if (this.getObjectNames().includes(type.name.value)) {
          return {
            type: this.mapNamedTypeValue("String", type.name.value),
            isRelation: true,
          };
        }
        if (
          this.getEnumTypes()
            .map((enumType) => enumType.name.value)
            .includes(type.name.value)
        ) {
          return {
            type: this.mapNamedTypeValue("Enum", type.name.value),
            isEnum: true,
          };
        }
        return {
          type: this.mapNamedTypeValue("String", type.name.value),
        };
    }
  }

  public mapEnumValue(type: EnumValueDefinitionNode): UnamedColumn {
    console.log("enum value", type);
    return {
      type: this.mapNamedTypeValue("String", type.name.value),
      isEnum: true,
    };
  }

  public mapEnumType(type: EnumTypeDefinitionNode): UnamedColumn {
    return {
      type: this.mapNamedTypeValue("String", type.name.value),
      isEnum: true,
    };
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

  mapNamedTypeValue(type: SchemaTypes, val: any): string {
    const mapperFunction = this.schemaLookup[type];
    if (!mapperFunction) {
      throw new Error(`Unsupported mapper: ${type}`);
    }
    if (typeof mapperFunction === "string") {
      return mapperFunction;
    }
    return mapperFunction(val);
  }
}
