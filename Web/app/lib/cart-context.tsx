"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { getCartItemCount, getCartSubtotal } from "@/app/lib/cart-utils";
import { getServerSnapshot, getSnapshot, setCartItems, subscribe } from "@/app/lib/cart-store";
import type { CartItem, Product } from "@/app/lib/types";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (params: { product: Product; quantity: number; notes?: string }) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Two lines merge into one when product and notes both match. */
function sameLine(a: CartItem, params: { product: Product; notes?: string }): boolean {
  return a.product.id === params.product.id && (a.notes ?? "") === (params.notes ?? "");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback<CartContextValue["addItem"]>(({ product, quantity, notes }) => {
    setCartItems((current) => {
      const existing = current.find((item) => sameLine(item, { product, notes }));
      if (existing) {
        return current.map((item) =>
          item.cartItemId === existing.cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartItem = {
        cartItemId: crypto.randomUUID(),
        product,
        quantity,
        notes,
      };
      return [...current, newItem];
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setCartItems((current) => current.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(cartItemId);
        return;
      }
      setCartItems((current) => current.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item)));
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setCartItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: getCartItemCount(items),
      subtotal: getCartSubtotal(items),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
