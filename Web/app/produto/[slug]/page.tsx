import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/app/components/product/product-detail";
import { JsonLd } from "@/app/components/seo/json-ld";
import { getProductBySlug } from "@/app/lib/products-api";
import { siteUrl, storeConfig } from "@/app/configs/store-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product?.available) return {};

  const url = `/produto/${product.slug}`;

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: product.name,
      description: product.description,
      images: [{ url: product.imageUrl, width: 600, height: 600, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Unavailable products 404 so they can't be ordered from an old link.
  if (!product?.available) notFound();

  const productUrl = `${siteUrl}/produto/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    url: productUrl,
    brand: { "@type": "Brand", name: storeConfig.name },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: storeConfig.currency,
      price: product.price.toFixed(2),
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: product.name, item: productUrl },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetail product={product} />
    </>
  );
}
