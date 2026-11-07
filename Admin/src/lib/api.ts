import { config } from "@/config";
import { session } from "@/lib/session";
import type { FeatureFlags, Product, ProductImageUpload, ProductInput, User } from "@/lib/types";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const token = session.get().token;
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["content-type"] = "application/json";
  if (init.auth !== false && token) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Não foi possível falar com o servidor. Tente de novo em instantes.");
  }

  // A rejected token on an authenticated call means the session is over.
  if (response.status === 401 && init.auth !== false) session.expire();
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(response.status, body?.message ?? `Request failed with ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  me: () => request<User>("/auth/me"),
  listProducts: () => request<Product[]>("/products"),
  getProduct: (id: string) => request<Product>(`/products/${encodeURIComponent(id)}`),
  createProduct: (input: ProductInput) => request<Product>("/products", { method: "POST", body: input }),
  updateProduct: (id: string, input: Partial<ProductInput>) =>
    request<Product>(`/products/${id}`, { method: "PATCH", body: input }),
  setAvailability: (id: string, available: boolean) =>
    request<Product>(`/products/${id}/availability`, { method: "PATCH", body: { available } }),
  deleteProduct: (id: string) => request<void>(`/products/${id}`, { method: "DELETE" }),
  getFeatureFlags: () => request<FeatureFlags>("/feature-flags"),
  updateFeatureFlags: (flags: Partial<FeatureFlags>) =>
    request<FeatureFlags>("/feature-flags", { method: "PATCH", body: flags }),
  /** Contract only for now: the API answers 501 until Cloudflare R2 is wired in. */
  requestProductImageUpload: (input: { contentType: ProductImageUpload["headers"]["Content-Type"]; size: number }) =>
    request<ProductImageUpload>("/uploads/product-image", { method: "POST", body: input }),
};

/** Turns any failure into a message the store owner can act on. */
export function friendlyError(error: unknown, notFound = "Esse pudim não existe mais."): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message;
    if (error.status === 404) return notFound;
    if (error.status === 400) return "Algum campo não foi aceito. Confira e tente de novo.";
    if (error.status === 401) return "Sua sessão expirou. Entre de novo para continuar.";
  }
  return "Algo deu errado. Tente de novo em instantes.";
}
