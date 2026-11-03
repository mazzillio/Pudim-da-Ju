import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { BackLink } from "@/components/admin/back-link";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { LoadError } from "@/components/admin/load-error";
import { ProductForm } from "@/components/admin/product-form";
import { ProductNotFound } from "@/components/admin/product-not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, api, friendlyError } from "@/lib/api";
import { useTitle } from "@/lib/use-title";

export function EditProductPage() {
  useTitle("Editar pudim");
  const { id = "" } = useParams();
  const query = useQuery({ queryKey: ["products", id], queryFn: () => api.getProduct(id), retry: false });

  if (query.isPending) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mx-auto aspect-4/3 w-full max-w-xs rounded-2xl" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (query.isError) {
    // 400 = malformed id in the URL; same answer as a missing product.
    if (query.error instanceof ApiError && (query.error.status === 404 || query.error.status === 400)) {
      return <ProductNotFound />;
    }
    return <LoadError message={friendlyError(query.error)} onRetry={() => query.refetch()} />;
  }

  const product = query.data;

  return (
    <div className="mx-auto max-w-xl">
      <BackLink />
      <h1 className="mb-5 font-heading text-xl font-semibold text-foreground">Editar {product.name}</h1>
      <ProductForm key={product.updatedAt} product={product} />

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Excluir pudim</h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Remove o pudim de vez. Para tirar da loja só por um tempo, use o botão "Disponível na loja".
        </p>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </section>
    </div>
  );
}
