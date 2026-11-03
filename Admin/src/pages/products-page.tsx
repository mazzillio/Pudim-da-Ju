import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { AdminProductCard } from "@/components/admin/admin-product-card";
import { LoadError } from "@/components/admin/load-error";
import { type StatusFilter, StatusTabs } from "@/components/admin/status-tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, friendlyError } from "@/lib/api";
import { useTitle } from "@/lib/use-title";

const filters: Record<StatusFilter, (available: boolean) => boolean> = {
  disponiveis: (available) => available,
  indisponiveis: (available) => !available,
};

export function ProductsPage() {
  useTitle("Meus pudins");
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const active = status === "disponiveis" || status === "indisponiveis" ? status : undefined;
  const query = useQuery({ queryKey: ["products"], queryFn: api.listProducts });

  const products = query.data ?? [];
  const availableCount = products.filter((product) => product.available).length;
  const visible = active ? products.filter((product) => filters[active](product.available)) : products;

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Meus pudins</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Desligue um pudim quando ele acabar — ele some da loja na hora.
          </p>
        </div>
        <Button size="lg" className="hidden sm:inline-flex" nativeButton={false} render={<Link to="/pudins/novo" />}>
          <Plus data-icon="inline-start" />
          Novo pudim
        </Button>
      </div>

      <StatusTabs
        active={active}
        counts={{ all: products.length, available: availableCount, unavailable: products.length - availableCount }}
      />

      {query.isPending ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <LoadError message={friendlyError(query.error)} onRetry={() => query.refetch()} />
      ) : visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            {active === "indisponiveis"
              ? "Todos os pudins estão disponíveis na loja."
              : active === "disponiveis"
                ? "Nenhum pudim está disponível na loja agora."
                : "Você ainda não cadastrou nenhum pudim."}
          </p>
          {!active && (
            <Button nativeButton={false} render={<Link to="/pudins/novo" />}>
              Cadastrar o primeiro pudim
            </Button>
          )}
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visible.map((product) => (
            <li key={product.id}>
              <AdminProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      {/* Thumb-reachable on phones, where the header button is hidden. */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur sm:hidden">
        <Button size="lg" className="h-11 w-full" nativeButton={false} render={<Link to="/pudins/novo" />}>
          <Plus data-icon="inline-start" />
          Novo pudim
        </Button>
      </div>
    </>
  );
}
