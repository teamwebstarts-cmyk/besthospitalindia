import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/treatments", destination: "/hospitals", permanent: true },
      { source: "/treatments/:path*", destination: "/hospitals", permanent: true },
      { source: "/medical-tourism", destination: "/hospitals", permanent: true },
      { source: "/medical-tourism/:path*", destination: "/hospitals", permanent: true },
    ]
  },
}

export default nextConfig