import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/*": ["./data/**/*"],
  },
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      // Custom domain → working deployment (SMTP configured on Production)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.swastikmakhana.co" }],
        destination: "https://swastikmakhana-five.vercel.app/:path*",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "swastikmakhana.co" }],
        destination: "https://swastikmakhana-five.vercel.app/:path*",
        permanent: false,
      },
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
    const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
    if (!backend) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
