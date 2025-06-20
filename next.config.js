const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  sw: "sw.js", // ✅ تحديد اسم ملف Service Worker المخصص
  disable: process.env.NODE_ENV === "development", // 🔁 تعطيل PWA أثناء التطوير
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /dynamic-css-manifest\.json$/,
  ],
  fallbacks: {
    document: "/offline.html", // 📄 صفحة تظهر عند فقدان الاتصال
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ucarecdn.com", "images.app.goo.gl", "res.cloudinary.com"], // ✅ دعم Cloudinary أيضًا
  },
  webpack(config, { isServer }) {
    // 🧠 دعم تحميل ملفات PDF worker (مثلاً عند استخدام pdfjs-dist)
    config.module.rules.push({
      test: /pdf\.worker\.entry\.js$/,
      use: {
        loader: "worker-loader",
        options: {
          filename: "static/chunks/pdf.worker.js",
        },
      },
    });

    return config;
  },
};

module.exports = withPWA(nextConfig);
