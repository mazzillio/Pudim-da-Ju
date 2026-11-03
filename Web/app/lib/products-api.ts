import type { Product } from "@/app/lib/types";

/**
 * Base URL of the Pudim da Ju API (../Api). Server-only: every catalog read
 * happens in Server Components, so the browser never calls the API directly.
 */
const API_URL = process.env.API_URL || "http://localhost:3333";

/**
 * Availability is toggled by the store owner at any time, so the catalog is
 * read fresh on every request instead of being baked in at build time.
 */
async function request<T>(path: string): Promise<T | undefined> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`GET ${path} failed with status ${response.status}`);
  return response.json() as Promise<T>;
}

/** The API also returns createdAt/updatedAt; keep only what the storefront uses. */
function toProduct(product: Product): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    available: product.available,
    orderType: product.orderType,
  };
}

/** `GET /products?available=true` — only what can be ordered right now. */
export async function getAvailableProducts(): Promise<Product[]> {
  const products = await request<Product[]>("/products?available=true");
  return (products ?? []).map(toProduct);
}

/** `GET /products/slug/:slug` */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await request<Product>(`/products/slug/${encodeURIComponent(slug)}`);
  return product && toProduct(product);
}
