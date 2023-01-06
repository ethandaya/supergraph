import { z } from "zod";

export const SeedSchema = z.object({
  id: z.number(),
  background: z.string(),
  body: z.string(),
  accessory: z.string(),
  head: z.string(),
  glasses: z.string(),
});

export const NounSchema = z.object({
  id: z.number(),
  seed: z.union([z.number(), z.null()]),
  owner: z.string(),
  votes: z.string().array(),
});

export const AuctionSchema = z.object({
  id: z.number(),
  noun: z.number(),
  amount: z.number(),
  startTime: z.number(),
  endTime: z.number(),
  settled: z.boolean(),
  bidder: z.union([z.string(), z.null()]),
  bids: z.string().array(),
});
