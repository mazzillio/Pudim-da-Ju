import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api, friendlyError } from "@/lib/api";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.deleteProduct(productId),
    onSuccess: () => {
      setOpen(false);
      toast.success(`${productName} foi excluído.`);
      queryClient.removeQueries({ queryKey: ["products", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/");
    },
    onError: (error) => toast.error(friendlyError(error, "Esse pudim já foi excluído.")),
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" size="lg" className="h-11 w-full sm:w-auto" />}>
        <Trash2 data-icon="inline-start" />
        Excluir pudim
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {productName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso não pode ser desfeito. Se ele só acabou por enquanto, é melhor deixar como
            indisponível — assim você não perde o cadastro.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Sim, excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
