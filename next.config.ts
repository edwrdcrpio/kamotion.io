import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this repo. Without this, an unrelated
  // package-lock.json in a parent directory confuses the resolver.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
