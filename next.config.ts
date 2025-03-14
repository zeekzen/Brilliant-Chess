import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  // reactStrictMode: false,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  distDir: "dist",
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ]
      }
    ]
  }
}

export default nextConfig