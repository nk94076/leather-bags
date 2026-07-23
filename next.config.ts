import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    localPatterns: [{ pathname: "/api/placeholder" }],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
