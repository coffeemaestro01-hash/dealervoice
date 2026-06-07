import type { NextConfig } from "next";
import path from "path";

const IS_DOCKER = process.env.DEPLOY_TARGET === "docker";

const nextConfig: NextConfig = {
  // standalone output only for Docker — Vercel handles its own bundling
  ...(IS_DOCKER && { output: "standalone" }),

  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.cloudflare.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
      { protocol: "https", hostname: process.env.NEXT_PUBLIC_CDN_DOMAIN || "cdn.dealervoice.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "frame-src https://js.stripe.com",
            "connect-src 'self' https://api.stripe.com wss:",
          ].join("; "),
        },
      ],
    },
    {
      source: "/api/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    },
  ],
  redirects: async () => [
    { source: "/dashboard", destination: "/dashboard/customer", permanent: false },
  ],
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, "@": path.resolve(__dirname) };
    return config;
  },
};

export default nextConfig;
