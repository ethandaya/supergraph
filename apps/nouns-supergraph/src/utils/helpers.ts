import { Account } from "../types/schema";
import { BIGINT_ZERO } from "./constants";

export async function getOrCreateAccount(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): Promise<Account> {
  let tokenHolder = await Account.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new Account(id);
    tokenHolder.tokenBalanceRaw = BIGINT_ZERO;
    tokenHolder.tokenBalance = BIGINT_ZERO;
    tokenHolder.totalTokensHeldRaw = BIGINT_ZERO;
    tokenHolder.totalTokensHeld = BIGINT_ZERO;
    tokenHolder.nouns = [];

    if (save) {
      tokenHolder.save();
    }
  }

  return tokenHolder as Account;
}
