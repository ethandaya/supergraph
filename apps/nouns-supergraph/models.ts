import { z } from "zod";

const baseSchema = z.object({
  id: z.string(),
  createdAt: z.bigint(),
  updatedAt: z.bigint(),
});

export const NounSchema = baseSchema.extend({
  id: z.string(),
  seed: z.nullable(z.number()),
  owner: z.string(),
});

export const BidSchema = baseSchema.extend({
  id: z.string(),
  noun: z.string().nullable(),
  amount: z.bigint(),
  bidder: z.string(),
  auction: z.string(),
  txIndex: z.bigint(),
  blockNumber: z.bigint(),
  blockTimestamp: z.date(),
});

export const AuctionSchema = baseSchema.extend({
  id: z.string(),
  noun: z.string(),
  amount: z.bigint(),
  startTime: z.bigint(),
  endTime: z.bigint(),
  settled: z.boolean(),
  bidder: z.string().nullable().default(null),
});

export const AccountSchema = baseSchema.extend({
  id: z.string(),
  delegate: z.string(),
  tokenBalanceRaw: z.bigint(),
  tokenBalance: z.bigint(),
  totalTokensHeldRaw: z.bigint(),
  totalTokensHeld: z.bigint(),
});
