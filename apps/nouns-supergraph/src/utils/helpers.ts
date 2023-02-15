import { Account } from "../types/schema";

export async function getOrCreateAccount(id: string): Promise<Account>;
export async function getOrCreateAccount(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): Promise<Account | null> {
  let tokenHolder = await Account.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new Account(id);
    tokenHolder.tokenBalanceRaw = BigInt(0);
    tokenHolder.tokenBalance = BigInt(0);
    tokenHolder.totalTokensHeldRaw = BigInt(0);
    tokenHolder.totalTokensHeld = BigInt(0);
    // tokenHolder.nouns = [];

    if (save) {
      await tokenHolder.save();
      return tokenHolder;
    }
  }

  return tokenHolder;
}
