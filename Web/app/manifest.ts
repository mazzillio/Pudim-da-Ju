import type { MetadataRoute } from "next";

import { storeConfig } from "@/app/configs/store-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: storeConfig.name,
    short_name: storeConfig.name,
    description: `Cardápio online de ${storeConfig.name}`,
    start_url: "/",
    display: "standalone",
    background_color: storeConfig.theme.surface,
    theme_color: storeConfig.theme.brand,
    icons: [
      {
        src: "/pudim-da-ju.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
