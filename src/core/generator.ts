import { Project } from "ts-morph";

export function generateClassForSchema(schemaName: string, schema: any) {
  const project = new Project();

  // Create a new source file and add the seed schema to it
  const sourceFile = project.createSourceFile(
    "./src/mapping/generated/schema_.ts"
  );

  sourceFile.addTypeAlias({
    name: schemaName + "Model",
    type: `z.infer<typeof ${schemaName}Schema>`,
  });

  let methods = [];

  for (const key in schema.shape) {
    const type = `${schemaName}Model["${key}"]`;
    // const isNullable = schema.shape[key].isNullable;
    methods.push({
      name: `get ${key}`,
      returnType: type,
      statements: [
        `const value = this.get("${key}")`,
        `if (!value) {`,
        `  throw new KeyAccessError<${schemaName}>("${key}")`,
        `}`,
        `return value`,
      ],
    });
    methods.push({
      name: `set ${key}`,
      parameters: [
        {
          name: "value",
          type,
        },
      ],
      statements: `this.set("${key}", value);`,
    });
  }

  sourceFile.addClass({
    name: schemaName,
    isExported: true,
    extends: `Entity<${schemaName}Model>`,
    ctors: [
      {
        parameters: [
          {
            name: "id",
            type: "string | number",
          },
        ],
        statements: [`super(id, ${schemaName}Schema, store)`],
      },
    ],
    methods,
  });

  // await sourceFile.save();

  return sourceFile.getFullText();
}
