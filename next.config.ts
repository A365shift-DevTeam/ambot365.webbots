import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow dynamic API routes to function correctly
  serverExternalPackages: ['jose'],
};

export default nextConfig;
