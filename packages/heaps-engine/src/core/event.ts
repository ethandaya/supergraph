export type Block = {
  number: bigint;
  timestamp: bigint;
};

export type Transaction = {
  hash: string;
  index: bigint;
};

export type SuperGraphEventType<T> = {
  params: T & {
    sender: string;
    value: bigint;
  };
  transaction: Transaction;
  block: Block;
};
