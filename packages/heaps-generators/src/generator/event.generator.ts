import { Project, SourceFile, VariableDeclarationKind } from "ts-morph";
import {
  Abi,
  AbiError,
  AbiEvent,
  AbiFunction,
  ExtractAbiEventNames,
} from "abitype";
import { format } from "prettier";
import fs from "fs";

export function isEventType(
  event: AbiFunction | AbiEvent | AbiError
): event is AbiEvent {
  return event.type === "event";
}

type EventGeneratorOptions = {
  abi: Abi;
  outputPath: string;
};
export class EventGenerator {
  private project: Project;
  public targetFile: SourceFile;

  public abi: Abi;

  constructor(private readonly options: EventGeneratorOptions) {
    this.project = new Project();
    this.targetFile = this.project.createSourceFile(
      options.outputPath,
      undefined,
      {
        overwrite: true,
      }
    );
    this.abi = options.abi;
  }

  get events() {
    return this.abi.filter(isEventType);
  }

  public generateImports() {
    this.targetFile.addImportDeclaration({
      namedImports: [
        "AbiParametersToPrimitiveTypes",
        "ExtractAbiEvent",
        "ExtractAbiEventNames",
        "narrow",
      ],
      moduleSpecifier: "abitype",
    });
    this.targetFile.addImportDeclaration({
      namedImports: ["SuperGraphEventType"],
      moduleSpecifier: "@heaps/engine",
    });
  }

  public inlineAbiEvents() {
    this.targetFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "abi",
          initializer: `narrow(${JSON.stringify(this.events, null, 2)})`,
        },
      ],
    });
  }

  public generateTypesForEvent(event: ExtractAbiEventNames<typeof this.abi>) {
    // TODO: addTypeAliases borked, will need to work out
    this.targetFile.addTypeAlias({
      name: `${event}Event`,
      type: `ExtractAbiEvent<typeof abi, "${event}">`,
      isExported: true,
    });
    this.targetFile.addTypeAlias({
      name: `${event}EventKeyType`,
      type: `${event}Event["inputs"][number]["name"]`,
      isExported: true,
    });
    this.targetFile.addTypeAlias({
      name: `${event}EventParamType`,
      type: `AbiParametersToPrimitiveTypes<${event}Event["inputs"]>`,
      isExported: true,
    });
    this.targetFile.addTypeAlias({
      name: event,
      type: `SuperGraphEventType<"${event}",${event}Event["inputs"]>`,
      isExported: true,
    });
  }

  public generateEventTypes() {
    this.events.forEach((event) => {
      this.generateTypesForEvent(event.name);
    });
    this.targetFile.addTypeAlias({
      isExported: true,
      name: "EventNames",
      type: "ExtractAbiEventNames<typeof abi>",
    });
  }

  public generate(save = false) {
    this.generateImports();
    this.inlineAbiEvents();
    this.generateEventTypes();

    if (save) {
      const formatted = format(this.targetFile.getText(), {
        parser: "typescript",
      });
      const header = `// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.`;
      fs.writeFileSync(this.options.outputPath, `${header}\n\n${formatted}`);
    }
  }
}
