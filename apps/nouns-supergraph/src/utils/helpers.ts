import { Account } from "../types/schema";

export function getOrCreateAccount(id: string): Account;
export function getOrCreateAccount(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): Account | null {
  let tokenHolder = Account.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new Account(id);
    tokenHolder.tokenBalanceRaw = "0";
    tokenHolder.tokenBalance = "0";
    tokenHolder.totalTokensHeldRaw = "0";
    tokenHolder.totalTokensHeld = "0";
    // tokenHolder.nouns = [];

    if (save) {
      tokenHolder.save();
      return tokenHolder;
    }
  }

  return tokenHolder;
}
