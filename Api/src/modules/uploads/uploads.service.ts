import { randomUUID } from "node:crypto";

import { NotImplementedError } from "../../shared/errors.js";
import type { ImageContentType, ProductImageStorage } from "./product-image-storage.js";
import type {
  CreateProductImageUploadBody,
  ProductImageUploadResponse,
} from "./uploads.schemas.js";

const EXTENSIONS: Record<ImageContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class UploadsService {
  constructor(private readonly storage?: ProductImageStorage) {}

  async createProductImageUpload({
    contentType,
  }: CreateProductImageUploadBody): Promise<ProductImageUploadResponse> {
    if (!this.storage) {
      throw new NotImplementedError("Image upload is not configured yet");
    }

    // The client never picks the object name, so it can't overwrite another photo.
    const key = `products/${randomUUID()}.${EXTENSIONS[contentType]}`;
    const signed = await this.storage.createSignedUpload({ key, contentType });

    return {
      uploadUrl: signed.uploadUrl,
      method: "PUT",
      headers: { "Content-Type": contentType },
      publicUrl: signed.publicUrl,
      key: signed.key,
      expiresAt: signed.expiresAt.toISOString(),
    };
  }
}
