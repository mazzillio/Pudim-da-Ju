"use client";

import { ArrowLeft, ShoppingBag } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import { CartItemRow } from "@/app/components/cart/cart-item-row";
import { useCart } from "@/app/lib/cart-context";
import { formatCurrency, storeConfig } from "@/app/configs/store-config";

function CheckoutFormSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-8 w-full rounded-2xl" />
        </div>
      ))}
      <Skeleton className="mt-2 h-9 w-full rounded-2xl" />
    </div>
  );
}

/** Deferred until the user reaches checkout, so its JS chunk never ships with the cart step. */
const CheckoutForm = dynamic(
  () => import("@/app/components/cart/checkout-form").then((mod) => mod.CheckoutForm),
  { loading: () => <CheckoutFormSkeleton />, ssr: false }
);

export function CartSheet() {
  const { items, itemCount, subtotal } = useCart();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const remainingForMinOrder = Math.max(0, storeConfig.minOrderItems - itemCount);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setStep("cart");
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Carrinho" className="relative" />
        }
      >
        <ShoppingBag />
        {itemCount > 0 && (
          <span
            key={itemCount}
            className="absolute -top-1.5 -right-1.5 flex size-4.5 animate-in zoom-in-50 duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
          >
            {itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            {step === "checkout" && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Voltar para o carrinho"
                onClick={() => setStep("cart")}
              >
                <ArrowLeft />
              </Button>
            )}
            {step === "cart" ? "Seu carrinho" : "Finalizar pedido"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          )}

          {step === "cart" && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]">
              {items.map((item, index) => (
                <div key={item.cartItemId}>
                  {index > 0 && <Separator />}
                  <CartItemRow item={item} />
                </div>
              ))}
            </div>
          )}

          {step === "checkout" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <CheckoutForm onOrderSent={() => handleOpenChange(false)} />
            </div>
          )}
        </div>

        {items.length > 0 && step === "cart" && (
          <div className="border-t border-border p-6">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            {remainingForMinOrder > 0 && (
              <p className="mb-3 text-center text-sm text-muted-foreground">
                Faltam {remainingForMinOrder} {remainingForMinOrder === 1 ? "item" : "itens"} para atingir o
                pedido mínimo de {storeConfig.minOrderItems} itens.
              </p>
            )}
            <Button
              className="w-full"
              size="lg"
              disabled={remainingForMinOrder > 0}
              onClick={() => setStep("checkout")}
            >
              Continuar
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
