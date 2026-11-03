import { BackLink } from "@/components/admin/back-link";
import { ProductForm } from "@/components/admin/product-form";
import { useTitle } from "@/lib/use-title";

export function NewProductPage() {
  useTitle("Novo pudim");

  return (
    <div className="mx-auto max-w-xl">
      <BackLink />
      <h1 className="mb-5 font-heading text-xl font-semibold text-foreground">Novo pudim</h1>
      <ProductForm />
    </div>
  );
}
