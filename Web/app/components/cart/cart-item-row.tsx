"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import { QuantitySelector } from "@/app/components/shared/quantity-selector";
import { getCartItemTotalPrice } from "@/app/lib/cart-utils";
import { useCart } from "@/app/lib/cart-context";
import { cn } from "@/app/lib/utils";
import { formatCurrency } from "@/app/configs/store-config";
import type { CartItem } from "@/app/lib/types";

const EXIT_DURATION_MS = 200;

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const [leaving, setLeaving] = useState(false);

  function handleRemove() {
    setLeaving(true);
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => removeItem(item.cartItemId), prefersReducedMotion ? 0 : EXIT_DURATION_MS);
  }

  return (
    <div
      className={cn(
        "flex gap-3 py-3",
        leaving
          ? "animate-out fade-out zoom-out-95 fill-mode-forwards duration-200 ease-[cubic-bezier(0.4,0,1,1)]"
          : "animate-in fade-in slide-in-from-top-1 fill-mode-backwards duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.product.name}</p>
        {item.notes && <p className="mt-0.5 text-xs text-muted-foreground">Obs: {item.notes}</p>}
        <div className="mt-2 flex items-center gap-2">
          <QuantitySelector quantity={item.quantity} onChange={(q) => updateQuantity(item.cartItemId, q)} />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remover item"
            onClick={handleRemove}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <p className="shrink-0 text-sm font-semibold text-foreground">{formatCurrency(getCartItemTotalPrice(item))}</p>
    </div>
  );
}
