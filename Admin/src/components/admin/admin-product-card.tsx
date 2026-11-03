import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { AvailabilitySwitch } from "@/components/admin/availability-switch";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/config";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminProductCard({ product }: { product: Product }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-2xl border-2 border-border bg-card p-3 transition-opacity",
        !product.available && "bg-muted/40",
      )}
    >
      <Link
        to={`/pudins/${product.id}`}
        className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <div className={cn("size-16 shrink-0 overflow-hidden rounded-xl bg-muted", !product.available && "opacity-50 grayscale")}>
          <img src={product.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-heading text-base font-semibold text-foreground">{product.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</span>
            {product.orderTypes.map((type) => (
              <Badge key={type} variant={type === "pronta-entrega" ? "default" : "secondary"}>
                {type === "pronta-entrega" ? "Pronta entrega" : "Encomenda"}
              </Badge>
            ))}
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-sm text-muted-foreground group-hover:text-foreground">
          Editar
          <ChevronRight className="size-4" />
        </span>
      </Link>
      <div className="flex justify-end border-t border-border pt-1">
        {/* Remount when the server value changes, so the local optimistic state never goes stale. */}
        <AvailabilitySwitch
          key={String(product.available)}
          productId={product.id} productName={product.name} available={product.available} />
      </div>
    </article>
  );
}
