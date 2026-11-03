/** Mirrors the API's product response (Api/src/modules/products/products.schemas.ts). */
export type OrderType = "pronta-entrega" | "encomenda";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  orderType: OrderType;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  orderType: OrderType;
}

/**
 * Contract of `POST /uploads/product-image` (Cloudflare R2 presigned PUT).
 * The API answers 501 until the storage is implemented; the form still takes
 * an image URL for now. See Api/src/modules/uploads.
 */
export interface ProductImageUpload {
  uploadUrl: string;
  method: "PUT";
  headers: { "Content-Type": "image/jpeg" | "image/png" | "image/webp" };
  publicUrl: string;
  key: string;
  expiresAt: string;
}
