export type Block = {
  number: bigint;
  timestamp: string;
};

export type Transaction = {
  hash: string;
  index: bigint;
};

export type SuperGraphEventType<T> = {
  backfill?: boolean;
  params: T & {
    sender: string;
    value: bigint;
  };
  transaction: Transaction;
  block: Block;
};
