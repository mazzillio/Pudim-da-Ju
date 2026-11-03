/**
 * Hosts whose images go through Next's optimizer (resized, WebP/AVIF).
 * Extend per deploy with NEXT_PUBLIC_IMAGE_HOSTS (public because
 * client components read it too; comma-separated, e.g. "cdn.pudimdaju.com.br").
 * Images from any other host still render, just unoptimized, so a product
 * created with a photo from an unexpected site never breaks the page.
 */
export const imageHosts = [
  "picsum.photos",
  ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

export function isOptimizableImage(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && imageHosts.includes(hostname);
  } catch {
    return false;
  }
}
