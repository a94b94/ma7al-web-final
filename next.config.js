const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [
    /app-build-manifest\\.json$/,
    /middleware-manifest\\.json$/,
    /dynamic-css-manifest\\.json$/,
  ],
  fallbacks: {
    document: "/offline.html",
  },
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ucarecdn.com", "images.app.goo.gl"],
  },
};

module.exports = withPWA(nextConfig);
