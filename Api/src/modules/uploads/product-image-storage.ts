import type { ALLOWED_IMAGE_TYPES } from "./uploads.schemas.js";

export type ImageContentType = (typeof ALLOWED_IMAGE_TYPES)[number];

export interface SignedUpload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresAt: Date;
}

/**
 * Where product photos live. The planned implementation is Cloudflare R2
 * (presigned PUT via aws4fetch); it is not built yet, so the app runs without one.
 */
export interface ProductImageStorage {
  createSignedUpload(params: { key: string; contentType: ImageContentType }): Promise<SignedUpload>;
  /** Removes a photo previously uploaded by this storage; no-op for foreign URLs. */
  deleteByPublicUrl(publicUrl: string): Promise<void>;
}
