import {
  Account,
  Delegate,
  DynamicQuorumParams,
  Governance,
  Proposal,
  Vote,
} from "../types/schema";
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "./constants";

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
      await tokenHolder.save();
    }
  }

  return tokenHolder as Account;
}

// These two functions are split up to minimize the extra code required
// to handle return types with `Type | null`
export async function getOrCreateDelegate(id: string): Promise<Delegate> {
  return getOrCreateDelegateWithNullOption(id, true, true) as Promise<Delegate>;
}

export async function getOrCreateDelegateWithNullOption(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): Promise<Delegate | null> {
  let delegate = await Delegate.load(id);
  if (delegate == null && createIfNotFound) {
    delegate = new Delegate(id);
    delegate.delegatedVotesRaw = BIGINT_ZERO;
    delegate.delegatedVotes = BIGINT_ZERO;
    delegate.tokenHoldersRepresentedAmount = 0;
    delegate.nounsRepresented = [];
    if (id != ZERO_ADDRESS) {
      let governance = await getGovernanceEntity();
      governance.totalDelegates = governance.totalDelegates + BIGINT_ONE;
      await governance.save();
    }
    if (save) {
      await delegate.save();
    }
  }
  return delegate;
}

export async function getOrCreateVote(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false
): Promise<Vote> {
  let vote = await Vote.load(id);

  if (vote == null && createIfNotFound) {
    vote = new Vote(id);

    if (save) {
      await vote.save();
    }
  }

  return vote as Vote;
}

export async function getOrCreateProposal(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false
): Promise<Proposal> {
  let proposal = await Proposal.load(id);

  if (proposal == null && createIfNotFound) {
    proposal = new Proposal(id);

    let governance = await getGovernanceEntity();

    governance.proposals = governance.proposals + BIGINT_ONE;
    await governance.save();

    if (save) {
      await proposal.save();
    }
  }

  return proposal as Proposal;
}

export async function getGovernanceEntity(): Promise<Governance> {
  let governance = await Governance.load("GOVERNANCE");

  if (governance == null) {
    governance = new Governance("GOVERNANCE");
    governance.proposals = BIGINT_ZERO;
    governance.totalTokenHolders = BIGINT_ZERO;
    governance.currentTokenHolders = BIGINT_ZERO;
    governance.currentDelegates = BIGINT_ZERO;
    governance.totalDelegates = BIGINT_ZERO;
    governance.delegatedVotesRaw = BIGINT_ZERO;
    governance.delegatedVotes = BIGINT_ZERO;
    governance.proposalsQueued = BIGINT_ZERO;
  }

  return governance;
}

export async function getOrCreateDynamicQuorumParams(
  block: bigint | null = null
): Promise<DynamicQuorumParams> {
  let params = await DynamicQuorumParams.load("LATEST");

  if (params == null) {
    params = new DynamicQuorumParams("LATEST");
    params.minQuorumVotesBPS = 0;
    params.maxQuorumVotesBPS = 0;
    params.quorumCoefficient = BIGINT_ZERO;
    params.dynamicQuorumStartBlock = block;

    await params.save();
  }

  if (params.dynamicQuorumStartBlock === null && block !== null) {
    params.dynamicQuorumStartBlock = block;

    await params.save();
  }

  return params as DynamicQuorumParams;
}
