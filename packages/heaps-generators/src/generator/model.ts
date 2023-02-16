import { Project, SourceFile, VariableDeclarationKind } from "ts-morph";
import {
  DefinitionNode,
  DocumentNode,
  Kind,
  ObjectTypeDefinitionNode,
  parse,
} from "graphql/language";
import * as fs from "fs";
import { SchemaHandler } from "../schema";
import { format } from "prettier";

function isEntityDefinition(
  node: DefinitionNode
): node is ObjectTypeDefinitionNode {
  return node.kind === Kind.OBJECT_TYPE_DEFINITION;
}

type ModelGeneratorOptions = {
  outputPath: string;
  schemaPath: string;
};

export class ModelGenerator {
  private project: Project;
  public targetFile: SourceFile;
  public schema: DocumentNode;

  constructor(private readonly options: ModelGeneratorOptions) {
    this.project = new Project();
    this.targetFile = this.project.createSourceFile(
      options.outputPath,
      undefined,
      { overwrite: true }
    );
    this.schema = this.loadSchema(options.schemaPath);
  }

  private loadSchema(path: string) {
    const document = fs.readFileSync(path, "utf-8");
    return parse(document);
  }

  public generateImports() {
    const imports = [
      {
        namedImports: ["z"],
        moduleSpecifier: "zod",
      },
      {
        namedImports: ["baseSchema"],
        moduleSpecifier: "@heaps/engine",
      },
    ];

    this.targetFile.addImportDeclarations(imports);
  }

  public generateModels() {
    const entities = this.schema.definitions.filter(isEntityDefinition);
    const generator = new SchemaHandler(this.schema, {
      String: "z.string()",
      Number: "z.number()",
      Boolean: "z.boolean()",
      BigInt: "z.bigint()",
      Date: "z.date()",
    });

    entities.forEach((entity) => {
      const columns = generator.mapFieldsToColumn(entity.fields || []);
      const types = columns.map((column) => {
        return `${column.name}: ${column.type}${
          column.isArray ? ".array()" : ""
        }`;
      });

      this.targetFile.addVariableStatements([
        {
          declarationKind: VariableDeclarationKind.Const,
          declarations: [
            {
              name: entity.name.value,
              initializer: `baseSchema.extend({ ${types.join(", ")} })`,
            },
          ],
          isExported: true,
        },
      ]);
    });
  }

  public generate(save = false) {
    this.generateImports();
    this.generateModels();
    if (save) {
      const formatted = format(this.targetFile.getText(), {
        parser: "typescript",
      });
      fs.writeFileSync(this.options.outputPath, formatted);
    }
  }
}
