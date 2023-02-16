import { ConstDirectiveNode, Kind } from "graphql";
import { DefinitionNode, ObjectTypeDefinitionNode } from "graphql/language";
import { EnumTypeDefinitionNode } from "graphql/language/ast";

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

export function isDerivedField(directives?: readonly ConstDirectiveNode[]) {
  if (!directives) {
    return;
  }
  return directives.some((directive) => directive.name.value === "derivedFrom");
}
