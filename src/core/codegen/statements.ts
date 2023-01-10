type GetterStatementOptions = {
  key: string;
  name: string;
  isBoolean: boolean;
  isNullable: boolean;
};

export function makeGetterStatements({
  key,
  name,
  isBoolean,
  isNullable,
}: GetterStatementOptions) {
  const hasModifier = isBoolean || isNullable;
  return [
    `const value = this.get("${key}")`,
    `if (typeof value === "undefined"${
      isNullable ? " && value !== null" : ""
    }) {`,
    `  throw new KeyAccessError<${name}>("${key}")`,
    `}`,
    `return ${hasModifier ? "formatModifiers(value, { isBoolean })" : "value"}`,
  ];
}

export function makeSetterStatements(key: string) {
  return `this.set("${key}", value);`;
}
