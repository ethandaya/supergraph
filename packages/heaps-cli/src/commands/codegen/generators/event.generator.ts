import { Project, SourceFile, VariableDeclarationKind } from "ts-morph";
import { Abi, AbiEvent, ExtractAbiEventNames } from "abitype";

type GenerateOptions = {
  shouldSave: boolean;
};

type EventGeneratorOptions = {
  abi: Abi;
  outputPath: string;
};
export class EventGenerator {
  private project: Project;
  public targetFile: SourceFile;

  public abi: Abi;
  private events: AbiEvent[];

  constructor(options: EventGeneratorOptions) {
    this.project = new Project();
    this.targetFile = this.project.createSourceFile(
      options.outputPath,
      undefined,
      {
        overwrite: true,
      }
    );
    this.abi = options.abi;
    this.events = this.abi.filter(
      (item) => item.type === "event"
    ) as AbiEvent[];
  }

  public generateImports() {
    this.targetFile.addImportDeclaration({
      namedImports: [
        "AbiParametersToPrimitiveTypes",
        "ExtractAbiEvent",
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
      type: `ExtractAbiEvent<typeof abi, "AuctionCreated">`,
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
      type: `SuperGraphEventType<{ [key in ${event}EventKeyType]: ${event}EventParamType[number] }>`,
      isExported: true,
    });
  }

  public generateEventTypes() {
    this.abi.map((item) => {
      if (item.type === "event") {
        this.generateTypesForEvent(item.name);
      }
    });
  }

  public generate(options: GenerateOptions = { shouldSave: true }) {
    this.generateImports();
    this.inlineAbiEvents();
    this.generateEventTypes();

    this.targetFile.prependWhitespace("\n\n");
    this.targetFile.insertText(
      0,
      "// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY."
    );
    if (options.shouldSave) {
      this.save();
    }
  }

  public save() {
    this.targetFile.saveSync();
  }
}
