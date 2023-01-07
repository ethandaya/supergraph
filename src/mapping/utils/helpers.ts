import { Account } from "../types/schema";

export async function getOrCreateAccount(id: string): Promise<Account>;
export async function getOrCreateAccount(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): Promise<Account | null> {
  const tokenHolder = await Account.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new Account(id);
    tokenHolder.tokenBalanceRaw = "0";
    tokenHolder.tokenBalance = "0";
    tokenHolder.totalTokensHeldRaw = "0";
    tokenHolder.totalTokensHeld = "0";
    tokenHolder.nouns = [];

    if (save) {
      await tokenHolder.save();
      return tokenHolder;
    }
  }

  return tokenHolder;
}
