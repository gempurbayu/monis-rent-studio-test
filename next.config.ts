import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Product photography is served from the monis.rent Strapi CDN.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "strapi.monis.rent",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
