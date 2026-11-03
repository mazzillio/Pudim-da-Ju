"use client";

import { useEffect } from "react";

import { SiteHeader } from "@/app/components/layout/site-header";
import { Button } from "@/app/components/ui/button";

/** Shown when the catalog API is down or answers with an error. */
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">Não conseguimos carregar o cardápio</h2>
        <p className="text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        <Button onClick={() => unstable_retry()}>Tentar novamente</Button>
      </main>
    </div>
  );
}
