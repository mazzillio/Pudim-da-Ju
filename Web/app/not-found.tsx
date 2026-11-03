import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/app/components/layout/site-header";
import { Button } from "@/app/components/ui/button";
import { storeConfig } from "@/app/configs/store-config";
import { buildWhatsappLink } from "@/app/lib/whatsapp";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

/** Any unknown URL, and products that are unavailable or no longer exist (notFound()). */
export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
        {storeConfig.logoUrl && (
          <Image
            src={storeConfig.logoUrl}
            alt=""
            width={96}
            height={96}
            className="size-24 rounded-full object-cover ring-1 ring-border"
          />
        )}
        <div>
          <p className="font-heading text-5xl font-semibold text-muted-foreground">404</p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-foreground">
            Esse pudim não está no cardápio
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A página que você procura não existe ou o pudim não está mais disponível. Dá uma olhada no
            que temos hoje!
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button size="lg" nativeButton={false} render={<Link href="/" />}>
            Ver o cardápio
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={buildWhatsappLink(`Olá! Não encontrei o que procurava no site da ${storeConfig.name}.`)}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            Falar no WhatsApp
          </Button>
        </div>
      </main>
    </div>
  );
}
