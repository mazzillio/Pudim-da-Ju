import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 text-center">
      <h1 className="font-heading text-lg font-semibold text-foreground">Pudim não encontrado</h1>
      <p className="text-sm text-muted-foreground">Ele pode ter sido excluído.</p>
      <Button nativeButton={false} render={<Link to="/" />}>
        Voltar para meus pudins
      </Button>
    </div>
  );
}
