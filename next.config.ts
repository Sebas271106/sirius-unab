import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qpefzjyacmkfrtdjgsja.supabase.co"
    return new URL(url).hostname
  } catch {
    return "qpefzjyacmkfrtdjgsja.supabase.co"
  }
})()

const nextConfig: NextConfig = {
  images: {
    // Allow optimizing images served from Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
