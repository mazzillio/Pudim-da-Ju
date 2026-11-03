import Image from "next/image";

import { CartSheet } from "@/app/components/cart/cart-sheet";
import { storeConfig } from "@/app/configs/store-config";

export function SiteHeader() {
  return (
    <header className="bg-primary">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-3 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          {storeConfig.logoUrl && (
            <Image
              src={storeConfig.logoUrl}
              alt={storeConfig.name}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover ring-1 ring-primary-foreground/30"
            />
          )}
          <h1 className="font-heading text-lg font-semibold text-primary-foreground">{storeConfig.name}</h1>
        </div>
        <CartSheet />
      </div>
    </header>
  );
}
