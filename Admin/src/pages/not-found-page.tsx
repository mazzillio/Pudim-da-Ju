import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { config } from "@/config";
import { useTitle } from "@/lib/use-title";

/** Public 404: lives outside the logged-in layout, so it works with or without a session. */
export function NotFoundPage() {
  useTitle("Página não encontrada");

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <img src={config.logoUrl} alt="" width={72} height={72} className="size-18 rounded-2xl" />
        <div>
          <p className="font-heading text-4xl font-semibold text-muted-foreground">404</p>
          <h1 className="mt-1 font-heading text-xl font-semibold text-foreground">Página não encontrada</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O endereço que você abriu não existe no painel. Confira o link ou volte para o início.
          </p>
        </div>
        <Button size="lg" className="h-11 w-full" nativeButton={false} render={<Link to="/" replace />}>
          Voltar para o painel
        </Button>
      </div>
    </main>
  );
}
