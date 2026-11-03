import type { NextConfig } from "next";

import { imageHosts } from "./app/configs/image-hosts";

const nextConfig: NextConfig = {
  // Lets phones and other machines on the local network use the dev server (HMR, /_next assets).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  images: {
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;
