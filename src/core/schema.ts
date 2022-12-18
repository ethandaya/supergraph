import { ObjectTypeDefinitionNode, parse } from "graphql/language";
import fs from "fs/promises";
import { createTable } from "./sql";

export async function parseSchema(filename: string) {
  const document = await fs.readFile(filename, "utf-8");
  const ast = parse(document);

  const entities = ast.definitions.filter(
    (def) =>
      def.kind === "ObjectTypeDefinition" &&
      def.directives?.find((dir) => dir.name.value === "entity")
  ) as ObjectTypeDefinitionNode[];

  const stmnt = entities.map(createTable);
  console.log(stmnt);
}
