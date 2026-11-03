import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { FormField } from "@/components/admin/form-field";
import { ProductImageField } from "@/components/admin/product-image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { describedBy } from "@/lib/described-by";
import { ADMIN_SWITCH_CLASS, Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api, friendlyError } from "@/lib/api";
import { type ProductFieldErrors, parseProductForm } from "@/lib/product-form";
import type { OrderType, Product, ProductInput } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDER_TYPE_OPTIONS: { value: OrderType; label: string; hint: string }[] = [
  { value: "pronta-entrega", label: "Pronta entrega", hint: "Já está pronto para levar" },
  { value: "encomenda", label: "Encomenda", hint: "Feito sob pedido" },
];

const DESCRIPTION_HINT = "Opcional. Conte o sabor, o tamanho e quantas pessoas serve.";

/** 45.9 -> "45,90", the way the owner reads and types prices. */
function formatPriceInput(price?: number) {
  return price === undefined ? "" : price.toFixed(2).replace(".", ",");
}

export function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [available, setAvailable] = useState(product?.available ?? true);
  const [orderType, setOrderType] = useState<OrderType>(product?.orderType ?? "pronta-entrega");
  const [errors, setErrors] = useState<ProductFieldErrors>({});

  const mutation = useMutation({
    mutationFn: (input: ProductInput) =>
      product ? api.updateProduct(product.id, input) : api.createProduct(input),
    onSuccess: (saved) => {
      toast.success(product ? `${saved.name} foi atualizado.` : `${saved.name} foi cadastrado.`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ name: "Já existe um pudim com esse nome. Escolha outro." });
        toast.error("Confira os campos marcados.");
        return;
      }
      toast.error(friendlyError(error));
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseProductForm(new FormData(event.currentTarget));
    if (parsed.errors) {
      setErrors(parsed.errors);
      toast.error("Confira os campos marcados.");
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <ProductImageField defaultValue={product?.imageUrl} error={errors.imageUrl} />

      <FormField id="name" label="Nome do pudim" error={errors.name}>
        <Input
          id="name"
          name="name"
          defaultValue={product?.name}
          placeholder="Ex.: Pudim de Leite Ninho"
          maxLength={120}
          aria-invalid={!!errors.name || undefined}
          aria-describedby={describedBy("name", errors.name)}
          className="h-11"
        />
      </FormField>

      <FormField id="description" label="Descrição" hint={DESCRIPTION_HINT} error={errors.description}>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          rows={3}
          maxLength={1000}
          aria-invalid={!!errors.description || undefined}
          aria-describedby={describedBy("description", errors.description, DESCRIPTION_HINT)}
        />
      </FormField>

      <FormField id="price" label="Preço" error={errors.price}>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            R$
          </span>
          <Input
            id="price"
            name="price"
            inputMode="decimal"
            defaultValue={formatPriceInput(product?.price)}
            placeholder="45,90"
            aria-invalid={!!errors.price || undefined}
            aria-describedby={describedBy("price", errors.price)}
            className="h-11 pl-9"
          />
        </div>
      </FormField>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Tipo</legend>
        <div className="grid grid-cols-2 gap-2">
          {ORDER_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer flex-col gap-0.5 rounded-2xl border-2 px-3 py-2.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
                orderType === option.value ? "border-primary bg-primary/40" : "border-border hover:bg-muted",
              )}
            >
              <input
                type="radio"
                name="orderType"
                value={option.value}
                checked={orderType === option.value}
                onChange={() => setOrderType(option.value)}
                aria-label={option.label}
                className="sr-only"
              />
              <span className="text-sm font-semibold text-foreground">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.hint}</span>
            </label>
          ))}
        </div>
        {errors.orderType && (
          <p role="alert" className="text-sm text-destructive">
            {errors.orderType}
          </p>
        )}
      </fieldset>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-border px-3 py-3">
        <span>
          <span className="block text-sm font-semibold text-foreground">Disponível na loja</span>
          <span className="block text-xs text-muted-foreground">
            {available ? "Aparece no cardápio para os clientes." : "Fica escondido do cardápio."}
          </span>
        </span>
        <input type="hidden" name="available" value={String(available)} />
        <Switch
          checked={available}
          onCheckedChange={setAvailable}
          aria-label="Disponível na loja"
          className={ADMIN_SWITCH_CLASS}
        />
      </label>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="outline" size="lg" className="h-11" nativeButton={false} render={<Link to="/" />}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="h-11" loading={mutation.isPending}>
          {product ? "Salvar alterações" : "Cadastrar pudim"}
        </Button>
      </div>
    </form>
  );
}
