import { Truck } from "lucide-react";

/** Strip right under the header, in the brand's chocolate ink over the peach header. */
export function FreeShippingBanner() {
  return (
    <div role="status" className="bg-foreground text-background">
      <p className="mx-auto flex w-full max-w-5xl items-center justify-center gap-2 px-3 py-2 text-center text-sm font-semibold lg:px-10">
        <Truck className="size-4 shrink-0" aria-hidden />
        Frete grátis hoje!
      </p>
    </div>
  );
}
