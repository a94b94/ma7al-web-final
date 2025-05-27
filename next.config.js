const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // يعطل الـ PWA أثناء التطوير
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/, // ✅ مهم جدًا
    /dynamic-css-manifest\.json$/ // ✅ هذا يحل مشكلتك الأساسية
  ],
  fallbacks: {
    document: "/offline.html", // ✅ احتياطي في حال تعذر التحميل
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ucarecdn.com", "images.app.goo.gl"],
  },
};

module.exports = withPWA(nextConfig);
