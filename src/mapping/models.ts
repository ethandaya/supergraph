import { z } from "zod";

export const NounSchema = z.object({
  id: z.string(),
  seed: z.nullable(z.number()),
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
  blockNumber: z.number(),
  blockTimestamp: z.bigint(),
});

export const AuctionSchema = z.object({
  id: z.string(),
  noun: z.string(),
  amount: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  settled: z.boolean(),
  bidder: z.nullable(z.string()),
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
