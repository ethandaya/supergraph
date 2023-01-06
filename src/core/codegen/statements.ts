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
    `if (!value${isNullable ? " && value !== null" : ""}) {`,
    `  throw new KeyAccessError<${name}>("${key}")`,
    `}`,
    `return value`,
  ];
}

export function makeSetterStatements(key: string) {
  return `this.set("${key}", value);`;
}
