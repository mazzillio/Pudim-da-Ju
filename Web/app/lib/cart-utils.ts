import type { CartItem, Product } from "@/app/lib/types";

export function getCartItemTotalPrice(item: CartItem): number {
  return item.product.price * item.quantity;
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartItemTotalPrice(item), 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Made to order only: it can't ship right away, so the customer must pick a date. */
function isMadeToOrderOnly(product: Product): boolean {
  // Carts saved before products had a list of types have no `orderTypes`.
  const types = product.orderTypes ?? [];
  return types.includes("encomenda") && !types.includes("pronta-entrega");
}

/**
 * "required": some item is made to order only.
 * "optional": some item can be made to order, but is also in stock.
 * "none": everything ships right away.
 */
export function getOrderDateRequirement(items: CartItem[]): "required" | "optional" | "none" {
  if (items.some((item) => isMadeToOrderOnly(item.product))) return "required";
  if (items.some((item) => item.product.orderTypes?.includes("encomenda"))) return "optional";
  return "none";
}

/** Earliest date a made-to-order item can be picked, as "YYYY-MM-DD" in the customer's timezone. */
export function getMinOrderDate(leadDays: number, now: Date = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + leadDays);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
