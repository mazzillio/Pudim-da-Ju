import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_SWITCH_CLASS, Switch } from "@/components/ui/switch";
import { api, friendlyError } from "@/lib/api";
import type { FeatureFlags } from "@/lib/types";

/** Feature flag "frete grátis": when on, the storefront shows a banner under the header. */
export function FreeShippingSwitch() {
  const queryClient = useQueryClient();
  const flags = useQuery({ queryKey: ["feature-flags"], queryFn: api.getFeatureFlags });

  const mutation = useMutation({
    mutationFn: (freeShipping: boolean) => api.updateFeatureFlags({ freeShipping }),
    // Flip instantly; roll back if the API refuses.
    onMutate: async (freeShipping) => {
      await queryClient.cancelQueries({ queryKey: ["feature-flags"] });
      const previous = queryClient.getQueryData<FeatureFlags>(["feature-flags"]);
      queryClient.setQueryData<FeatureFlags>(["feature-flags"], (current) => ({ ...current, freeShipping }));
      return { previous };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["feature-flags"], data);
      toast.success(data.freeShipping ? "Frete grátis ligado na loja." : "Frete grátis desligado.");
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(["feature-flags"], context?.previous);
      toast.error(friendlyError(error));
    },
  });

  if (flags.isPending) return <Skeleton className="mb-4 h-18 rounded-2xl" />;
  // A failure here shouldn't block the catalog below; the switch just stays hidden.
  if (flags.isError) return null;

  const checked = flags.data.freeShipping;

  return (
    <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 select-none">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Truck className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">Frete grátis hoje</span>
        <span className="block text-xs text-muted-foreground">
          {checked ? "A loja está mostrando o aviso de frete grátis." : "Ligue para avisar na loja que o frete é grátis."}
        </span>
      </span>
      <Switch
        checked={checked}
        onCheckedChange={(next) => mutation.mutate(next)}
        disabled={mutation.isPending}
        aria-label="Frete grátis hoje"
        className={ADMIN_SWITCH_CLASS}
      />
    </label>
  );
}
