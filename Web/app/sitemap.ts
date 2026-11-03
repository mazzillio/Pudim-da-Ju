import type { MetadataRoute } from "next";

import { getAvailableProducts } from "@/app/lib/products-api";
import { siteUrl } from "@/app/configs/store-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAvailableProducts();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...products.map((product) => ({
      url: `${siteUrl}/produto/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
