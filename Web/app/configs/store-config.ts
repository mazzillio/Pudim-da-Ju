import type { StoreConfig } from "@/app/lib/types";

/** Public site URL, used for metadataBase, canonical URLs, sitemap and robots.txt. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://seu-dominio.com.br";

/** Physical store address, used for schema.org LocalBusiness structured data. */
export const storeAddress = {
  streetAddress: "Rua Exemplo, 123, Centro",
  addressLocality: "Sua Cidade",
  addressRegion: "UF",
  postalCode: "00000-000",
  addressCountry: "BR",
};

/**
 * Central place to customize this store instance: name, WhatsApp number,
 * payment options, delivery fee and theme colors. The theme only needs four
 * base colors; app/globals.css derives the rest of the palette from them.
 *
 * The WhatsApp number can be overridden per-deploy via NEXT_PUBLIC_WHATSAPP_NUMBER
 * (digits only, with country + area code, e.g. 5511999999999), and the brand
 * color via NEXT_PUBLIC_THEME_BRAND (e.g. #fcdbae).
 */
export const storeConfig: StoreConfig = {
  name: "Pudim da Ju",
  tagline: "Pudins Artesanais",
  logoUrl: "/pudim-da-ju.svg",
  theme: {
    brand: process.env.NEXT_PUBLIC_THEME_BRAND || "#fcdbae",
    brandForeground: process.env.NEXT_PUBLIC_THEME_BRAND_FOREGROUND || "#3d1809",
    surface: process.env.NEXT_PUBLIC_THEME_SURFACE || "#fdf8f1",
    ink: process.env.NEXT_PUBLIC_THEME_INK || "#3d1809",
  },
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999",
  currency: "BRL",
  locale: "pt-BR",
  paymentMethods: ["Dinheiro", "Pix"],
  deliveryFee: 5.0,
  minOrderItems: 1,
};

/** Human-readable one-line version of storeAddress, for pickup orders. */
export function formatStoreAddress(): string {
  return `${storeAddress.streetAddress}, ${storeAddress.addressLocality} - ${storeAddress.addressRegion}, CEP ${storeAddress.postalCode}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(value);
}
