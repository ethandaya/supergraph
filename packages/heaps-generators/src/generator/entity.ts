import { Project, SourceFile } from "ts-morph";
import * as fs from "fs";
import { format } from "prettier";

type EntityGeneratorOptions = {
  isAsync: boolean;
  outputPath: string;
  storePath: string;
};

export class EntityGenerator {
  private project: Project;
  public targetFile: SourceFile;

  constructor(private readonly options: EntityGeneratorOptions) {
    this.project = new Project();
    this.targetFile = this.project.createSourceFile(
      options.outputPath,
      undefined,
      { overwrite: true }
    );
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
        namedImports: ["store"],
        moduleSpecifier: this.options.storePath,
      },
    ];

    this.targetFile.addImportDeclarations(imports);
  }

  public generate(save = false) {
    this.generateImports();
    if (save) {
      const formatted = format(this.targetFile.getText(), {
        parser: "typescript",
      });
      fs.writeFileSync(this.options.outputPath, formatted);
    }
  }
}
