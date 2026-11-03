"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { QuantitySelector } from "@/app/components/shared/quantity-selector";
import { useCart } from "@/app/lib/cart-context";
import { isOptimizableImage } from "@/app/configs/image-hosts";
import { formatCurrency } from "@/app/configs/store-config";
import type { Product } from "@/app/lib/types";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isNavigating, startTransition] = useTransition();

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  function handleAddToCart() {
    addItem({ product, quantity, notes: notes || undefined });
    toast.success(`${product.name} adicionado ao carrinho`);
    startTransition(() => {
      router.push("/");
    });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Voltar"
          nativeButton={false}
          render={<Link href="/" />}
        >
          <ArrowLeft />
        </Button>
        <p className="font-heading text-base font-semibold text-foreground">Detalhes do produto</p>
      </header>

      <div className="px-4 pt-4">
        <div
          className="relative mx-auto aspect-4/3 w-full max-w-md animate-in fade-in blur-in-4 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-backwards overflow-hidden rounded-2xl bg-muted"
        >
          <Image
            src={product.imageUrl}
            unoptimized={!isOptimizableImage(product.imageUrl)}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 28rem, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div
        className="mx-auto w-full max-w-md flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-backwards px-4 pb-28 pt-4"
        style={{ animationDelay: "80ms" }}
      >
        <h1 className="font-heading text-lg font-semibold text-foreground">{product.name}</h1>
        <p className="mt-1 text-base font-semibold text-foreground">{formatCurrency(product.price)}</p>
        <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>

        <div className="border-t border-border py-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Observações</h2>
          <Textarea
            placeholder="Ex: alguma observação sobre este item?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center gap-3 border-t border-border bg-background p-4">
        <QuantitySelector quantity={quantity} onChange={setQuantity} />
        <Button className="flex-1" size="lg" loading={isNavigating} onClick={handleAddToCart}>
          Adicionar · {formatCurrency(product.price * quantity)}
        </Button>
      </div>
    </div>
  );
}
