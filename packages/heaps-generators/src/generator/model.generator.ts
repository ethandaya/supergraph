import { Project, SourceFile, VariableDeclarationKind } from "ts-morph";
import { DocumentNode, parse } from "graphql/language";
import * as fs from "fs";
import { SchemaHandler } from "../schema";
import { format } from "prettier";
import { isEnumTypeDefinition, isObjectTypeDefinition } from "../common";

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

  protected loadSchema(path: string) {
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
    const entities = this.schema.definitions.filter(isObjectTypeDefinition);
    const generator = new SchemaHandler(this.schema, {
      String: "z.string()",
      Number: "z.number()",
      Boolean: "z.boolean()",
      BigInt: "z.bigint()",
      Date: "z.date()",
      Bytes: "z.string()",
      Enum: (name: string) => name,
    });

    entities.forEach((entity) => {
      const columns = generator
        .mapFieldsToColumn(entity.fields || [])
        .filter((col) => col.name !== "id");
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
              name: `${entity.name.value}Schema`,
              initializer: `baseSchema.extend({ ${types.join(", ")} })`,
            },
          ],
          isExported: true,
        },
      ]);
    });
  }

  public generateEnums() {
    const enums = this.schema.definitions.filter(isEnumTypeDefinition);
    enums.forEach((enumType) => {
      const values = enumType.values?.map((value) => `"${value.name.value}"`);
      if (!values) return;
      this.targetFile.addVariableStatements([
        {
          declarationKind: VariableDeclarationKind.Const,
          declarations: [
            {
              name: enumType.name.value,
              initializer: `z.enum([${values.join(", ")}])`,
            },
          ],
          isExported: true,
        },
      ]);
    });
  }

  public generate(save = false) {
    this.generateImports();
    this.generateEnums();
    this.generateModels();
    if (save) {
      const formatted = format(this.targetFile.getText(), {
        parser: "typescript",
      });
      const header = `// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.`;
      fs.writeFileSync(this.options.outputPath, `${header}\n\n${formatted}`);
    }
  }
}