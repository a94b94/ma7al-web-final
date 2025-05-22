const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // يعطل الـ PWA أثناء التطوير
  buildExcludes: [/app-build-manifest\.json$/], // تجاهل ملف app-build-manifest.json من الـ precache
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ucarecdn.com", "images.app.goo.gl"], // السماح بهذه النطاقات للصور
  },
};

module.exports = withPWA(nextConfig);
