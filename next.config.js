const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  sw: "sw.js",
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /dynamic-css-manifest\.json$/,
  ],
  fallbacks: {
    document: "/offline.html",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["ucarecdn.com", "images.app.goo.gl", "res.cloudinary.com"],
  },

  // ✅ Redirect قديم → جديد
  async redirects() {
    return [
      {
        source: "/api/whatsapp",
        destination: "/api/whatsapp/status",
        permanent: false, // 307/308 حسب المنصة، خليها false حتى تقدر تغيّر لاحقًا
      },
    ];
  },

  webpack(config, { isServer }) {
    // 🧠 دعم تحميل ملفات PDF worker (pdfjs-dist)
    if (!isServer) {
      config.module.rules.push({
        test: /pdf\.worker\.entry\.js$/,
        use: {
          loader: "worker-loader",
          options: {
            filename: "static/chunks/pdf.worker.js",
          },
        },
      });
    }

    return config;
  },
};

module.exports = withPWA(nextConfig);
