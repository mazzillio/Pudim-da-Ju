import { SiteHeader } from "@/app/components/layout/site-header";
import { Skeleton } from "@/app/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border-2 border-border p-3">
      <div className="min-w-0 flex-1 py-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2.5 h-3.5 w-full" />
        <Skeleton className="mt-1.5 h-3.5 w-2/3" />
        <Skeleton className="mt-3 h-4 w-14" />
      </div>
      <Skeleton className="size-28 shrink-0 rounded-xl" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 pb-10 lg:px-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 px-3 py-6 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
