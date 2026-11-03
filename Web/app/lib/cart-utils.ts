import type { CartItem } from "@/app/lib/types";

export function getCartItemTotalPrice(item: CartItem): number {
  return item.product.price * item.quantity;
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartItemTotalPrice(item), 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
