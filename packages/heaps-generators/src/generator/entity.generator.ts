import {
  MethodDeclarationStructure,
  OptionalKind,
  Project,
  SourceFile,
} from "ts-morph";
import * as fs from "fs";
import { format } from "prettier";
import { isDerivedField, isObjectTypeDefinition } from "../common";
import { DocumentNode, Kind, parse } from "graphql/language";
import { FieldDefinitionNode } from "graphql/index";

type EntityGeneratorOptions = {
  isAsync: boolean;
  outputPath: string;
  storeImportPath: string;
  modelImportPath: string;
  schemaPath: string;
};

type GetterStatementOptions = {
  key: string;
  name: string;
  isNullable: boolean;
};

export function makeGetterStatements({
  key,
  name,
  isNullable,
}: GetterStatementOptions) {
  return [
    `const value = this.get("${key}")`,
    `if (typeof value === "undefined"${
      isNullable ? " && value !== null" : ""
    }) {`,
    `  throw new KeyAccessError<${name}>("${key}")`,
    `}`,
    `return value`,
  ];
}

export function makeSetterStatements(key: string) {
  return `this.set("${key}", value);`;
}

export class EntityGenerator {
  private project: Project;
  public targetFile: SourceFile;
  public schema: DocumentNode;

  constructor(private readonly options: EntityGeneratorOptions) {
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

  get entities() {
    return this.schema.definitions.filter(isObjectTypeDefinition);
  }

  public generateImports() {
    const imports = [
      {
        namedImports: ["z"],
        moduleSpecifier: "zod",
      },
      {
        namedImports: [
          `${this.options.isAsync ? "Async" : "Sync"}CrudEntity`,
          "KeyAccessError",
        ],
        moduleSpecifier: "@heaps/engine",
      },
      {
        namedImports: [...this.entities.map((e) => e.name.value + "Schema")],
        moduleSpecifier: this.options.modelImportPath,
      },
      {
        namedImports: ["store"],
        moduleSpecifier: this.options.storeImportPath,
      },
    ];

    this.targetFile.addImportDeclarations(imports);
  }

  public generateTypeForModel(name: string) {
    this.targetFile.addTypeAlias({
      name: name + "Model",
      type: `z.infer<typeof ${name}Schema>`,
    });
  }

  public generateEntityForModel(
    name: string,
    fields: readonly FieldDefinitionNode[]
  ) {
    let methods: OptionalKind<MethodDeclarationStructure>[] = [];
    methods.push({
      name: "load",
      isStatic: true,
      isAsync: this.options.isAsync,
      parameters: [
        {
          name: "id",
          type: "string",
        },
      ],
      returnType: this.options.isAsync
        ? `Promise<${name} | null>`
        : `${name} | null`,
      statements: [
        `const data =${
          this.options.isAsync ? " await" : ""
        } store.get("${name}", id);`,
        `if (!data) {`,
        `   return new ${name}(id);`,
        `}`,
        `return new ${name}(id, data);`,
      ],
    });

    const fieldsToGenerate = fields.filter(
      (field) => !isDerivedField(field.directives)
    );

    for (const idx in fieldsToGenerate) {
      const field = fieldsToGenerate[idx];
      const key = field.name.value;
      const type = `${name}Model["${key}"]`;
      const isNullable = field.type.kind === Kind.NON_NULL_TYPE;
      methods.push({
        name: `get ${key}`,
        returnType: type,
        statements: makeGetterStatements({
          key,
          name,
          isNullable,
        }),
      });
      methods.push({
        name: `set ${key}`,
        parameters: [{ name: "value", type }],
        statements: makeSetterStatements(key),
      });
    }

    this.targetFile.addClass({
      name,
      isExported: true,
      extends: `${
        this.options.isAsync ? "Async" : "Sync"
      }CrudEntity<"${name}", ${name}Model, typeof ${name}Schema>`,
      ctors: [
        {
          parameters: [
            {
              name: "id",
              type: "string",
            },
            {
              name: "data",
              type: `${name}Model`,
              hasQuestionToken: true,
            },
          ],
          statements: [
            `super(id, "${name}", ${name}Schema, store)`,
            `this._data = { id, ...data } || { id };`,
          ],
        },
      ],
      methods,
    });
  }

  public generateDefinitionsForModel(
    name: string,
    fields: readonly FieldDefinitionNode[]
  ) {
    this.generateTypeForModel(name);
    this.generateEntityForModel(name, fields);
  }

  public generateEntities() {
    for (const en in this.entities) {
      const entity = this.entities[en];
      this.generateDefinitionsForModel(entity.name.value, entity.fields || []);
    }
  }

  public generate(save = false) {
    this.generateImports();
    this.generateEntities();
    if (save) {
      const formatted = format(this.targetFile.getText(), {
        parser: "typescript",
      });
      const header = `// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.`;
      fs.writeFileSync(this.options.outputPath, `${header}\n\n${formatted}`);
    }
  }
}
