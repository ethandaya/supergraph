import { z } from "zod";

// export type SeedModel = {
//   id: number;
//   background: string;
//   body: string;
//   accessory: string;
//   head: string;
//   glasses: string;
// };

export const SeedSchema = z.object({
  id: z.number(),
  background: z.string(),
  body: z.string(),
  accessory: z.string(),
  head: z.string(),
  glasses: z.string(),
});

export type SeedModel = z.infer<typeof SeedSchema>;

export const NounSchema = z.object({
  id: z.number(),
  seed: z.union([z.number(), z.null()]),
  owner: z.string(),
  votes: z.string().array(),
});

export type NounModel = z.infer<typeof NounSchema>;

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

export type AuctionModel = z.infer<typeof AuctionSchema>;
