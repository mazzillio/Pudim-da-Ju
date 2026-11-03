import { z } from "zod";

export const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});

export const idParamsSchema = z.object({
  id: z.uuid(),
});
