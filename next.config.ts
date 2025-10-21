import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
   eslint: {
    ignoreDuringBuilds: true,
  },

   images: {
    domains: ['res.cloudinary.com', 'idsbackend-production.up.railway.app'], // Aquí, directamente en nextConfig
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    
    return config;
  },
};

export default nextConfig;
