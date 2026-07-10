import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: projectRoot,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
