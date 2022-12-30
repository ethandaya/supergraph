CREATE TABLE
  DelegationEvent (
    id INTEGER NOT NULL,
    noun_id INTEGER,
    previousDelegate_id INTEGER,
    newDelegate_id INTEGER,
    blockNumber NUMERIC(75, 0) NOT NULL,
    blockTimestamp NUMERIC(75, 0) NOT NULL
  );

CREATE TABLE
  TransferEvent (
    id INTEGER NOT NULL,
    noun_id INTEGER,
    previousHolder_id INTEGER,
    newHolder_id INTEGER,
    blockNumber NUMERIC(75, 0) NOT NULL,
    blockTimestamp NUMERIC(75, 0) NOT NULL
  );

CREATE TABLE
  Seed (
    id INTEGER NOT NULL,
    background NUMERIC(75, 0) NOT NULL,
    body NUMERIC(75, 0) NOT NULL,
    accessory NUMERIC(75, 0) NOT NULL,
    head NUMERIC(75, 0) NOT NULL,
    glasses NUMERIC(75, 0) NOT NULL
  );

CREATE TABLE
  Noun (
    id INTEGER NOT NULL,
    seed_id INTEGER,
    owner_id INTEGER,
    votes_ids INTEGER
  );

CREATE TABLE
  Bid (
    id INTEGER NOT NULL,
    noun_id INTEGER,
    amount NUMERIC(75, 0) NOT NULL,
    bidder_id INTEGER,
    blockNumber NUMERIC(75, 0) NOT NULL,
    txIndex NUMERIC(75, 0) NOT NULL,
    auction_id INTEGER,
    blockTimestamp NUMERIC(75, 0) NOT NULL
  );

CREATE TABLE
  Auction (
    id INTEGER NOT NULL,
    noun_id INTEGER,
    amount NUMERIC(75, 0) NOT NULL,
    startTime NUMERIC(75, 0) NOT NULL,
    endTime NUMERIC(75, 0) NOT NULL,
    bidder_id INTEGER,
    settled BOOLEAN NOT NULL,
    bids_ids INTEGER
  );

CREATE TABLE
  Account (
    id INTEGER NOT NULL,
    delegate_id INTEGER,
    tokenBalanceRaw NUMERIC(75, 0) NOT NULL,
    tokenBalance NUMERIC(75, 0) NOT NULL,
    totalTokensHeldRaw NUMERIC(75, 0) NOT NULL,
    totalTokensHeld NUMERIC(75, 0) NOT NULL,
    nouns_ids INTEGER
  );

CREATE TABLE
  Delegate (
    id INTEGER NOT NULL,
    delegatedVotesRaw NUMERIC(75, 0) NOT NULL,
    delegatedVotes NUMERIC(75, 0) NOT NULL,
    tokenHoldersRepresentedAmount INTEGER NOT NULL,
    tokenHoldersRepresented_ids INTEGER,
    nounsRepresented_ids INTEGER,
    votes_ids INTEGER,
    proposals_ids INTEGER
  );

CREATE TABLE
  Proposal (
    id INTEGER NOT NULL,
    proposer_id INTEGER,
    targets BYTEA NOT NULL,
    values
      NUMERIC(75, 0) NOT NULL,
      signatures VARCHAR(255) NOT NULL,
      calldatas BYTEA NOT NULL,
      createdTimestamp NUMERIC(75, 0) NOT NULL,
      createdBlock NUMERIC(75, 0) NOT NULL,
      createdTransactionHash BYTEA NOT NULL,
      startBlock NUMERIC(75, 0) NOT NULL,
      endBlock NUMERIC(75, 0) NOT NULL,
      proposalThreshold NUMERIC(75, 0) NOT NULL,
      quorumVotes NUMERIC(75, 0) NOT NULL,
      forVotes NUMERIC(75, 0) NOT NULL,
      againstVotes NUMERIC(75, 0) NOT NULL,
      abstainVotes NUMERIC(75, 0) NOT NULL,
      description VARCHAR(255) NOT NULL,
      executionETA NUMERIC(75, 0) NOT NULL,
      votes_ids INTEGER,
      totalSupply NUMERIC(75, 0) NOT NULL,
      minQuorumVotesBPS INTEGER NOT NULL,
      maxQuorumVotesBPS INTEGER NOT NULL,
      quorumCoefficient NUMERIC(75, 0) NOT NULL
  );

CREATE TABLE
  Vote (
    id INTEGER NOT NULL,
    support BOOLEAN NOT NULL,
    supportDetailed INTEGER NOT NULL,
    votesRaw NUMERIC(75, 0) NOT NULL,
    votes NUMERIC(75, 0) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    voter_id INTEGER,
    nouns_ids INTEGER,
    proposal_id INTEGER,
    blockNumber NUMERIC(75, 0) NOT NULL
  );

CREATE TABLE
  Governance (
    id INTEGER NOT NULL,
    proposals NUMERIC(75, 0) NOT NULL,
    currentTokenHolders NUMERIC(75, 0) NOT NULL,
    currentDelegates NUMERIC(75, 0) NOT NULL,
    totalTokenHolders NUMERIC(75, 0) NOT NULL,
    totalDelegates NUMERIC(75, 0) NOT NULL,
    delegatedVotesRaw NUMERIC(75, 0) NOT NULL,
    delegatedVotes NUMERIC(75, 0) NOT NULL,
    proposalsQueued NUMERIC(75, 0) NOT NULL
  );

CREATE TABLE
  DynamicQuorumParams (
    id INTEGER NOT NULL,
    minQuorumVotesBPS INTEGER NOT NULL,
    maxQuorumVotesBPS INTEGER NOT NULL,
    quorumCoefficient NUMERIC(75, 0) NOT NULL,
    dynamicQuorumStartBlock NUMERIC(75, 0) NOT NULL
  );