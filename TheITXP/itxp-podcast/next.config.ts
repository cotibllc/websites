import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.libsyn.com" },
      { protocol: "https", hostname: "traffic.libsyn.com" },
    ],
  },
};

export default nextConfig;
