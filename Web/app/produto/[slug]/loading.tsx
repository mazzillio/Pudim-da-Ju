import { ArrowLeft } from "lucide-react";

import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <div className="flex size-7 items-center justify-center text-muted-foreground/40">
          <ArrowLeft className="size-4" />
        </div>
        <p className="font-heading text-base font-semibold text-foreground">Detalhes do produto</p>
      </header>

      <div className="px-4 pt-4">
        <Skeleton className="mx-auto aspect-4/3 w-full max-w-md rounded-2xl" />
      </div>

      <div className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="mt-2.5 h-4 w-20" />
        <Skeleton className="mt-3.5 h-3.5 w-full" />
        <Skeleton className="mt-1.5 h-3.5 w-4/5" />

        <div className="mt-4 border-t border-border py-4">
          <Skeleton className="mb-2 h-3.5 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center gap-3 border-t border-border bg-background p-4">
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}
