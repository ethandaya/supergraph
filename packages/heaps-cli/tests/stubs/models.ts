import { z } from "zod";

export const TestSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  address: z.string(),
});
