/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strip console.* from production bundles (smaller JS, cleaner console) — keep errors.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      // Supabase storage (admin-uploaded covers, avatars, category icons, QR, etc.)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
