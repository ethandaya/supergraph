import { z } from "zod";

export const NounSchema = z.object({
  id: z.string(),
  seed: z.nullable(z.number()),
  owner: z.string(),
});

export const BidSchema = z.object({
  id: z.string(),
  noun: z.string(),
  // TODO - add alt store to support bigint
  amount: z.string(),
  bidder: z.string(),
  auction: z.string(),
  txIndex: z.bigint(),
  blockNumber: z.bigint(),
  blockTimestamp: z.string(),
});

export const AuctionSchema = z.object({
  id: z.string(),
  noun: z.string(),
  amount: z.bigint(),
  startTime: z.bigint(),
  endTime: z.bigint(),
  settled: z.boolean(),
  bidder: z.string().nullable().default(null),
});

export const AccountSchema = z.object({
  id: z.string(),
  delegate: z.string(),
  tokenBalanceRaw: z.string(),
  tokenBalance: z.string(),
  totalTokensHeldRaw: z.string(),
  totalTokensHeld: z.string(),
});
