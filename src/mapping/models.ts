import { z } from "zod";

// export const DelegationEventSchema = z.object({
//   id: z.string(),
//   noun: z.string(),
//   previousDelegate: z.string(),
//   newDelegate: z.string(),
// });

// export const TransferEventSchema = z.object({
//   id: z.string(),
//   noun: z.string(),
//   previousHolder: z.string(),
//   newHolder: z.string(),
// });

// export const SeedSchema = z.object({
//   id: z.string(),
//   background: z.string(),
//   body: z.string(),
//   accessory: z.string(),
//   head: z.string(),
//   glasses: z.string(),
// });

export const NounSchema = z.object({
  id: z.string(),
  seed: z.union([z.number(), z.null()]),
  owner: z.string(),
  votes: z.string().array(),
});

export const BidSchema = z.object({
  id: z.string(),
  noun: z.string(),
  amount: z.string(),
  bidder: z.string(),
  auction: z.string(),
  txIndex: z.number(),
  blockNumber: z.bigint(),
  blockTimestamp: z.bigint(),
});

export const AuctionSchema = z.object({
  id: z.string(),
  noun: z.string(),
  amount: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  settled: z.boolean(),
  bidder: z.union([z.string(), z.null()]),
  bids: z.string().array(),
});

export const AccountSchema = z.object({
  id: z.string(),
  delegate: z.string(),
  tokenBalanceRaw: z.string(),
  tokenBalance: z.string(),
  totalTokensHeldRaw: z.string(),
  totalTokensHeld: z.string(),
  nouns: z.string().array(),
});
