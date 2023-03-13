import {
  DelegateChanged,
  DelegateVotesChanged,
  NounCreated,
  Transfer,
} from "./types/NounsToken/NounsToken";
import { DelegationEvent, Noun, Seed, TransferEvent } from "./types/schema";
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "./utils/constants";
import { log } from "./utils/stub";
import {
  getGovernanceEntity,
  getOrCreateAccount,
  getOrCreateDelegate,
} from "./utils/helpers";

export async function handleNounCreated(event: NounCreated) {
  let nounId = event.params.tokenId.toString();

  let seed = new Seed(nounId);
  seed.background = BigInt(event.params.seed.background);
  seed.body = BigInt(event.params.seed.body);
  seed.accessory = BigInt(event.params.seed.accessory);
  seed.head = BigInt(event.params.seed.head);
  seed.glasses = BigInt(event.params.seed.glasses);
  await seed.save();

  let noun = await Noun.load(nounId);
  if (noun == null) {
    log.error("[handleNounCreated] Noun #{} not found. Hash: {}", [
      nounId,
      event.transaction.hash,
    ]);
    return;
  }

  noun.seed = seed.id;
  await noun.save();
}

export async function handleDelegateChanged(event: DelegateChanged) {
  let tokenHolder = await getOrCreateAccount(event.params.delegator);
  let previousDelegate = await getOrCreateDelegate(event.params.fromDelegate);
  let newDelegate = await getOrCreateDelegate(event.params.toDelegate);

  const accountNouns = tokenHolder.nouns;

  tokenHolder.delegate = newDelegate.id;
  await tokenHolder.save();

  previousDelegate.tokenHoldersRepresentedAmount =
    previousDelegate.tokenHoldersRepresentedAmount - 1;
  let previousNounsRepresented = previousDelegate.nounsRepresented;
  previousDelegate.nounsRepresented = previousNounsRepresented.filter(
    (n) => !accountNouns.includes(n)
  );
  newDelegate.tokenHoldersRepresentedAmount =
    newDelegate.tokenHoldersRepresentedAmount + 1;
  let newNounsRepresented = newDelegate.nounsRepresented; // Re-assignment required to update array
  for (let i = 0; i < accountNouns.length; i++) {
    newNounsRepresented.push(accountNouns[i]);
  }
  newDelegate.nounsRepresented = newNounsRepresented;
  await previousDelegate.save();
  await newDelegate.save();

  // Log a transfer event for each Noun
  for (let i = 0; i < accountNouns.length; i++) {
    let delegateChangedEvent = new DelegationEvent(
      event.transaction.hash + "_" + accountNouns[i]
    );
    delegateChangedEvent.blockNumber = event.block.number;
    delegateChangedEvent.blockTimestamp = event.block.timestamp;
    delegateChangedEvent.noun = accountNouns[i];
    delegateChangedEvent.previousDelegate = previousDelegate.id
      ? previousDelegate.id
      : tokenHolder.id;
    delegateChangedEvent.newDelegate = newDelegate.id
      ? newDelegate.id
      : tokenHolder.id;
    await delegateChangedEvent.save();
  }
}

export async function handleDelegateVotesChanged(event: DelegateVotesChanged) {
  let governance = await getGovernanceEntity();
  let delegate = await getOrCreateDelegate(event.params.delegate);
  let votesDifference = event.params.newBalance - event.params.previousBalance;

  delegate.delegatedVotesRaw = event.params.newBalance;
  delegate.delegatedVotes = event.params.newBalance;
  await delegate.save();

  if (
    event.params.previousBalance == BIGINT_ZERO &&
    event.params.newBalance > BIGINT_ZERO
  ) {
    governance.currentDelegates = governance.currentDelegates + BIGINT_ONE;
  }
  if (event.params.newBalance == BIGINT_ZERO) {
    governance.currentDelegates = governance.currentDelegates - BIGINT_ONE;
  }
  governance.delegatedVotesRaw = governance.delegatedVotesRaw - votesDifference;
  governance.delegatedVotes = governance.delegatedVotesRaw;
  await governance.save();
}

export async function handleTransfer(event: Transfer) {
  let fromHolder = await getOrCreateAccount(event.params.from);
  let toHolder = await getOrCreateAccount(event.params.to);
  let governance = await getGovernanceEntity();
  const transferredNounId = event.params.tokenId.toString();

  let transferEvent = new TransferEvent(
    event.transaction.hash + "_" + transferredNounId
  );
  transferEvent.blockNumber = event.block.number;
  transferEvent.blockTimestamp = event.block.timestamp;
  transferEvent.noun = event.params.tokenId.toString();
  transferEvent.previousHolder = fromHolder.id.toString();
  transferEvent.newHolder = toHolder.id.toString();
  await transferEvent.save();

  // fromHolder
  if (event.params.from == ZERO_ADDRESS) {
    governance.totalTokenHolders = governance.totalTokenHolders + BIGINT_ONE;
    await governance.save();
  } else {
    let fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
    fromHolder.tokenBalanceRaw = fromHolder.tokenBalanceRaw - BIGINT_ONE;
    fromHolder.tokenBalance = fromHolder.tokenBalanceRaw;
    let fromHolderNouns = fromHolder.nouns; // Re-assignment required to update array
    fromHolder.nouns = fromHolderNouns.filter((n) => n != transferredNounId);

    if (fromHolder.delegate != null) {
      let fromHolderDelegate = await getOrCreateDelegate(fromHolder.delegate);
      let fromHolderNounsRepresented = fromHolderDelegate.nounsRepresented; // Re-assignment required to update array
      fromHolderDelegate.nounsRepresented = fromHolderNounsRepresented.filter(
        (n) => n != transferredNounId
      );
      await fromHolderDelegate.save();
    }

    if (fromHolder.tokenBalanceRaw < BIGINT_ZERO) {
      log.error("Negative balance on holder {} with balance {}", [
        fromHolder.id,
        fromHolder.tokenBalanceRaw.toString(),
      ]);
    }

    if (
      fromHolder.tokenBalanceRaw == BIGINT_ZERO &&
      fromHolderPreviousBalance > BIGINT_ZERO
    ) {
      governance.currentTokenHolders =
        governance.currentTokenHolders - BIGINT_ONE;
      governance.save();

      fromHolder.delegate = null;
    } else if (
      fromHolder.tokenBalanceRaw > BIGINT_ZERO &&
      fromHolderPreviousBalance == BIGINT_ZERO
    ) {
      governance.currentTokenHolders =
        governance.currentTokenHolders + BIGINT_ONE;
      governance.save();
    }

    fromHolder.save();
  }

  // toHolder
  if (event.params.to == ZERO_ADDRESS) {
    governance.totalTokenHolders = governance.totalTokenHolders + BIGINT_ONE;
    governance.save();
  }

  let delegateChangedEvent = new DelegationEvent(
    event.transaction.hash + "_" + event.params.tokenId.toString()
  );
  delegateChangedEvent.blockNumber = event.block.number;
  delegateChangedEvent.blockTimestamp = event.block.timestamp;
  delegateChangedEvent.noun = event.params.tokenId.toString();
  delegateChangedEvent.previousDelegate = fromHolder.delegate
    ? fromHolder.delegate!.toString()
    : fromHolder.id.toString();
  delegateChangedEvent.newDelegate = toHolder.delegate
    ? toHolder.delegate!.toString()
    : toHolder.id.toString();
  delegateChangedEvent.save();

  let toHolderDelegate = await getOrCreateDelegate(
    toHolder.delegate ? toHolder.delegate! : toHolder.id
  );
  let toHolderNounsRepresented = toHolderDelegate.nounsRepresented; // Re-assignment required to update array
  toHolderNounsRepresented.push(transferredNounId);
  toHolderDelegate.nounsRepresented = toHolderNounsRepresented;
  await toHolderDelegate.save();

  let toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw + BIGINT_ONE;
  toHolder.tokenBalance = toHolder.tokenBalanceRaw;
  toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw + BIGINT_ONE;
  toHolder.totalTokensHeld = toHolder.totalTokensHeldRaw;
  let toHolderNouns = toHolder.nouns; // Re-assignment required to update array
  toHolderNouns.push(event.params.tokenId.toString());
  toHolder.nouns = toHolderNouns;

  if (
    toHolder.tokenBalanceRaw == BIGINT_ZERO &&
    toHolderPreviousBalance > BIGINT_ZERO
  ) {
    governance.currentTokenHolders =
      governance.currentTokenHolders + BIGINT_ONE;
    await governance.save();
  } else if (
    toHolder.tokenBalanceRaw > BIGINT_ZERO &&
    toHolderPreviousBalance == BIGINT_ZERO
  ) {
    governance.currentTokenHolders =
      governance.currentTokenHolders + BIGINT_ONE;
    await governance.save();

    toHolder.delegate = toHolder.id;
  }

  let noun = await Noun.load(transferredNounId);
  if (noun == null) {
    noun = new Noun(transferredNounId);
  }

  noun.owner = toHolder.id;
  await noun.save();
  await toHolder.save();
}
