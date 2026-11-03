import type { OrderType, ProductInput } from "@/lib/types";

export type ProductField = "name" | "description" | "price" | "imageUrl" | "orderTypes";
export type ProductFieldErrors = Partial<Record<ProductField, string>>;

export const ORDER_TYPES: OrderType[] = ["pronta-entrega", "encomenda"];

/** Accepts the ways people type money: "45", "45,9", "45,90", "1.234,50", "45.90". */
export function parsePrice(raw: string): number | undefined {
  const cleaned = raw.replace(/[R$\s]/g, "");
  if (!cleaned) return undefined;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return undefined;
  return Number(normalized);
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates the admin form in Portuguese before anything reaches the API. */
export function parseProductForm(
  formData: FormData,
): { data: ProductInput; errors?: undefined } | { data?: undefined; errors: ProductFieldErrors } {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parsePrice(String(formData.get("price") ?? ""));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const selected = formData.getAll("orderTypes").map(String);
  const orderTypes = ORDER_TYPES.filter((type) => selected.includes(type));
  const available = formData.get("available") === "true";

  const errors: ProductFieldErrors = {};
  if (!name) errors.name = "Dê um nome para o pudim.";
  else if (name.length > 120) errors.name = "O nome pode ter no máximo 120 letras.";
  if (description.length > 1000) errors.description = "A descrição pode ter no máximo 1000 letras.";
  if (price === undefined || price <= 0) errors.price = "Informe um preço válido, por exemplo 45,90.";
  else if (price > 100_000) errors.price = "Esse preço parece alto demais.";
  if (!imageUrl) errors.imageUrl = "Cole o link da foto do pudim.";
  else if (!isHttpsUrl(imageUrl)) errors.imageUrl = "O link da foto precisa começar com https://";
  if (orderTypes.length === 0) errors.orderTypes = "Marque pronta entrega, encomenda ou os dois.";

  if (Object.keys(errors).length > 0) return { errors };
  return { data: { name, description, price: price as number, imageUrl, available, orderTypes } };
}
