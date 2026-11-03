import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const createProductImageUploadBodySchema = z.object({
  /** MIME type of the (already resized) file the browser is about to send. */
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  /** File size in bytes, checked before a URL is signed. */
  size: z.number().int().positive().max(MAX_IMAGE_SIZE_BYTES),
});

/**
 * Contract for a direct browser → Cloudflare R2 upload:
 * the client sends the file with `method` to `uploadUrl`, including `headers`,
 * then saves the product with `imageUrl = publicUrl`.
 */
export const productImageUploadResponseSchema = z.object({
  uploadUrl: z.url(),
  method: z.literal("PUT"),
  headers: z.object({ "Content-Type": z.enum(ALLOWED_IMAGE_TYPES) }),
  publicUrl: z.url(),
  /** Object key inside the bucket, e.g. `products/<uuid>.webp`. */
  key: z.string(),
  expiresAt: z.iso.datetime(),
});

export type CreateProductImageUploadBody = z.infer<typeof createProductImageUploadBodySchema>;
export type ProductImageUploadResponse = z.infer<typeof productImageUploadResponseSchema>;
