/**
 * Admin panel settings. Theme defaults match the storefront (Web) so both
 * look like the same brand; override per deploy with VITE_THEME_*.
 */
export const config = {
  storeName: "Pudim da Ju",
  logoUrl: "/pudim-da-ju.svg",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3333",
  /** Storefront URL, for the "Ver loja" link. */
  storeUrl: import.meta.env.VITE_STORE_URL || "http://localhost:3000",
  locale: "pt-BR",
  currency: "BRL",
  theme: {
    brand: import.meta.env.VITE_THEME_BRAND || "#fcdbae",
    brandForeground: import.meta.env.VITE_THEME_BRAND_FOREGROUND || "#3d1809",
    surface: import.meta.env.VITE_THEME_SURFACE || "#fdf8f1",
    ink: import.meta.env.VITE_THEME_INK || "#3d1809",
  },
};

export function applyTheme() {
  const root = document.documentElement.style;
  root.setProperty("--brand", config.theme.brand);
  root.setProperty("--brand-foreground", config.theme.brandForeground);
  root.setProperty("--surface", config.theme.surface);
  root.setProperty("--ink", config.theme.ink);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency }).format(value);
}
