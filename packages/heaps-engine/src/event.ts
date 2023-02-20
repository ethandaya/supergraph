import { AbiParameter, AbiParameterToPrimitiveType } from "abitype";

export type Block = {
  number: bigint;
  timestamp: bigint;
};

export type Transaction = {
  hash: string;
  index: bigint;
};

export type NamedABIParameter = AbiParameter & { name: string };

export type ExcludeUnnamedParametersFromInputs<
  T extends readonly AbiParameter[],
  E = { name?: undefined; type: string }
> = T extends [infer F, ...infer R extends AbiParameter[]]
  ? [F] extends [E]
    ? ExcludeUnnamedParametersFromInputs<R, E>
    : [F, ...ExcludeUnnamedParametersFromInputs<R, E>]
  : [];

export type MapNamedABIParametersToParams<T extends Array<NamedABIParameter>> =
  {
    [K in T[number]["name"]]: AbiParameterToPrimitiveType<
      Extract<T[number], { name: K }>
    >;
  };

export type SuperGraphEventType<T extends AbiParameter[]> = {
  backfill?: boolean;
  params: MapNamedABIParametersToParams<
    ExcludeUnnamedParametersFromInputs<T>
  > & {
    sender: string;
    value: bigint;
  };
  transaction: Transaction;
  block: Block;
};
