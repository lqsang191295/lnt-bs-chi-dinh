import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '1024mb', // Tăng lên 1024MB
    },
  },  
};

export default nextConfig;
