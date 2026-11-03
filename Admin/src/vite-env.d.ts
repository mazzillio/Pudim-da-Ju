/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_STORE_URL?: string;
  readonly VITE_THEME_BRAND?: string;
  readonly VITE_THEME_BRAND_FOREGROUND?: string;
  readonly VITE_THEME_SURFACE?: string;
  readonly VITE_THEME_INK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
