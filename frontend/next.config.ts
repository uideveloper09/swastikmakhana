import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      {
        source: "/pc/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/makhana/roasted-makhana",
        destination: "/makhana/plain-makhana",
        permanent: false,
      },
      {
        source: "/makhana/masala-makhana",
        destination: "/makhana/plain-makhana",
        permanent: false,
      },
      {
        source: "/makhana/peri-peri-makhana",
        destination: "/makhana/plain-makhana",
        permanent: false,
      },
      {
        source: "/makhana/chocolate-makhana",
        destination: "/makhana/plain-makhana",
        permanent: false,
      },
      {
        source: "/makhana/flavored-mix",
        destination: "/makhana/plain-makhana",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:8090"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
