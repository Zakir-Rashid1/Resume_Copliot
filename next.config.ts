import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.31.247", "localhost:3000"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["pg-cloudflare", "puppeteer-core", "puppeteer"],
};

export default nextConfig;
