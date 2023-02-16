export class KeyAccessError<T> extends Error {
  constructor(key: keyof T) {
    super(`${String(key)} accessed before set`);
  }
}
