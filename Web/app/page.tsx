import { OrderTypeTabs } from "@/app/components/catalog/order-type-tabs";
import { ProductCard } from "@/app/components/catalog/product-card";
import { FreeShippingBanner } from "@/app/components/layout/free-shipping-banner";
import { SiteHeader } from "@/app/components/layout/site-header";
import { getFeatureFlags } from "@/app/lib/feature-flags-api";
import { getAvailableProducts } from "@/app/lib/products-api";
import type { OrderType } from "@/app/lib/types";

const orderTypes: OrderType[] = ["pronta-entrega", "encomenda"];

export default async function Home({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams;
  const activeType = orderTypes.find((type) => type === tipo);
  const [products, flags] = await Promise.all([getAvailableProducts(), getFeatureFlags()]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />
      {flags.freeShipping && <FreeShippingBanner />}
      <main className="mx-auto w-full max-w-5xl flex-1 pb-10 lg:px-6">
        <OrderTypeTabs active={activeType} />
        <div key={activeType ?? "todos"} className="grid grid-cols-1 gap-x-6 gap-y-6 px-3 py-6 sm:grid-cols-2">
          {products
            .filter((product) => !activeType || product.orderTypes.includes(activeType))
            .map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-2 blur-in-4 fill-mode-backwards duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
