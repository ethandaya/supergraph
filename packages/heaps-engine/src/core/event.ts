export type Transaction = {
  hash: string;
};

export type SuperGraphEventType<T> = {
  params: T;
  transaction: Transaction;
};

export class EventValue<T extends string | bigint | boolean | null> {
  constructor(public value: T) {}
  public toHex(): T {
    return this.value;
  }
}
