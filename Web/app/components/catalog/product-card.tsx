import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/app/components/ui/badge";
import { isOptimizableImage } from "@/app/configs/image-hosts";
import { formatCurrency } from "@/app/configs/store-config";
import type { Product } from "@/app/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex gap-4 rounded-2xl border-2 border-border p-3 outline-none transition-[background-color,transform] duration-150 hover:bg-muted focus-visible:bg-muted active:scale-[0.98]"
    >
      <div className="min-w-0 flex-1 py-1.5">
        <Badge variant={product.orderType === "pronta-entrega" ? "default" : "secondary"} className="mb-1.5">
          {product.orderType === "pronta-entrega" ? "Pronta entrega" : "Encomenda"}
        </Badge>
        <h2 className="font-heading text-base font-semibold text-foreground">{product.name}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-2.5 text-base font-semibold text-foreground">{formatCurrency(product.price)}</p>
      </div>
      <div className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={product.imageUrl}
          unoptimized={!isOptimizableImage(product.imageUrl)}
          alt={product.name}
          fill
          sizes="112px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </Link>
  );
}
