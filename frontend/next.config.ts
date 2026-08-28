import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "secure-file-storage-e0cc56e1a49a5000.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
