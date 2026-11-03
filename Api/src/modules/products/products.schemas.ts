import { z } from "zod";

export const orderTypeSchema = z.enum(["pronta-entrega", "encomenda"]);

/** At least one type; "both" is just the two of them. Duplicates are dropped. */
const orderTypesSchema = z
  .array(orderTypeSchema)
  .min(1)
  .transform((types) => orderTypeSchema.options.filter((type) => types.includes(type)));

const slugSchema = z
  .string()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and hyphens");

/** Writable fields without defaults, so `.partial()` gives a clean PATCH body. */
const productFieldsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  description: z.string().trim().max(1000),
  /** In reais, e.g. 45.9. Rounded to cents when stored. */
  price: z.number().positive().max(100_000),
  imageUrl: z.url(),
  available: z.boolean(),
  orderTypes: orderTypesSchema,
});

export const createProductBodySchema = productFieldsSchema.extend({
  slug: slugSchema.optional(),
  description: productFieldsSchema.shape.description.default(""),
  available: z.boolean().default(true),
  orderTypes: orderTypesSchema.default(["pronta-entrega"]),
});

export const updateProductBodySchema = productFieldsSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, "at least one field is required");

export const availabilityBodySchema = z.object({
  available: z.boolean(),
});

export const listProductsQuerySchema = z.object({
  available: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  orderType: orderTypeSchema.optional(),
});

export const slugParamsSchema = z.object({
  slug: slugSchema,
});

export const productResponseSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string(),
  available: z.boolean(),
  orderTypes: z.array(orderTypeSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
