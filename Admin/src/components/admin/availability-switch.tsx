import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { ADMIN_SWITCH_CLASS, Switch } from "@/components/ui/switch";
import { api, friendlyError } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Saves on toggle, no submit button: flips instantly and rolls back if the API refuses. */
export function AvailabilitySwitch({
  productId,
  productName,
  available,
}: {
  productId: string;
  productName: string;
  available: boolean;
}) {
  const queryClient = useQueryClient();
  const [checked, setChecked] = useState(available);

  const mutation = useMutation({
    mutationFn: (next: boolean) => api.setAvailability(productId, next),
    onSuccess: (_, next) => {
      toast.success(next ? `${productName} voltou para a loja.` : `${productName} saiu da loja.`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error, next) => {
      setChecked(!next);
      toast.error(friendlyError(error));
    },
  });

  function handleChange(next: boolean) {
    setChecked(next);
    mutation.mutate(next);
  }

  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl py-1.5 pl-1 select-none">
      <span className={cn("text-sm font-medium", checked ? "text-foreground" : "text-muted-foreground")}>
        {checked ? "Disponível" : "Indisponível"}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        disabled={mutation.isPending}
        aria-label={`${productName} disponível na loja`}
        className={ADMIN_SWITCH_CLASS}
      />
    </label>
  );
}
