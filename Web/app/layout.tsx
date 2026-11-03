import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/app/lib/utils";
import { CartProvider } from "@/app/lib/cart-context";
import { Toaster } from "@/app/components/ui/sonner";
import { JsonLd } from "@/app/components/seo/json-ld";
import { siteUrl, storeAddress, storeConfig } from "@/app/configs/store-config";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = `${storeConfig.tagline} em ${storeAddress.addressLocality} - ${storeAddress.addressRegion}. Peça pelo WhatsApp com entrega ou retirada no local.`;

const { theme } = storeConfig;

/** Overrides the default base colors in globals.css with the ones from storeConfig.theme. */
const themeCss = `:root{--brand:${theme.brand};--brand-foreground:${theme.brandForeground};--surface:${theme.surface};--ink:${theme.ink};}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${storeConfig.name} | ${storeConfig.tagline}`,
    template: `%s | ${storeConfig.name}`,
  },
  description,
  keywords: [
    "pudim",
    "pudim artesanal",
    "pudim de leite condensado",
    "sobremesa",
    storeConfig.name,
    storeAddress.addressLocality,
  ],
  authors: [{ name: storeConfig.name }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: storeConfig.name,
    title: storeConfig.name,
    description,
    images: storeConfig.logoUrl
      ? [{ url: storeConfig.logoUrl, width: 512, height: 512, alt: storeConfig.name }]
      : undefined,
  },
  twitter: {
    card: "summary",
    title: storeConfig.name,
    description,
    images: storeConfig.logoUrl ? [storeConfig.logoUrl] : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: theme.brand,
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: storeConfig.name,
  image: storeConfig.logoUrl ? `${siteUrl}${storeConfig.logoUrl}` : undefined,
  url: siteUrl,
  telephone: `+${storeConfig.whatsappNumber}`,
  priceRange: "R$",
  address: {
    "@type": "PostalAddress",
    ...storeAddress,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("h-full", "antialiased", geistMono.variable, "font-sans", inter.variable)}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="flex min-h-full flex-col">
        <JsonLd data={localBusinessJsonLd} />
        <CartProvider>{children}</CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
