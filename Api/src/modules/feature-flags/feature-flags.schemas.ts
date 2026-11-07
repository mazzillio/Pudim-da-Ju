import { z } from "zod";

/** Every flag the API knows about. Add a key here to create a new flag (it starts off). */
export const featureFlagKeys = ["freeShipping"] as const;
export type FeatureFlagKey = (typeof featureFlagKeys)[number];

export const featureFlagsResponseSchema = z.object({
  /** Shows the "frete grátis hoje" banner on the storefront. */
  freeShipping: z.boolean(),
});

export const updateFeatureFlagsBodySchema = featureFlagsResponseSchema
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, "at least one flag is required");

export type FeatureFlagsResponse = z.infer<typeof featureFlagsResponseSchema>;
export type UpdateFeatureFlagsBody = z.infer<typeof updateFeatureFlagsBodySchema>;
