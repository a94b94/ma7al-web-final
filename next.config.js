/* next.config.js */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  sw: "sw.js",
  disable: process.env.NODE_ENV === "development",

  // ✅ يقلل مشاكل build مع Next
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /dynamic-css-manifest\.json$/,
  ],

  // ✅ تنظيف كاش قديم
  cleanupOutdatedCaches: true,

  // ✅ صفحة أوفلاين
  fallbacks: {
    document: "/offline.html",
  },

  // اختياري:
  // cacheOnFrontEndNav: true,
  // reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // ✅ تحسين أداء الصور
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,

    // الدومينات المباشرة
    domains: ["ucarecdn.com", "res.cloudinary.com"],

    // Google hosted images (بديل صحيح لـ images.app.goo.gl)
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
    ],
  },

  // ✅ Redirect قديم → جديد
  async redirects() {
    return [
      {
        source: "/api/whatsapp",
        destination: "/api/whatsapp/status",
        permanent: false,
      },
    ];
  },

  /**
   * ✅ Headers صحيحة (بدون Regex غير مدعوم)
   * - /_next/static: كاش قوي لملفات Next (js/css/chunks)
   * - /public assets: كاش قوي لأي ملفات داخل public (صور/خطوط)
   * - HTML & API: منع كاش (حتى ما تكسر تحديثات المتجر/PWA)
   */
  async headers() {
    return [
      // 1) Next static assets (أفضل مكان للكاش القوي)
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // 2) أي ملفات داخل /public (مثل icons, manifest, images, fonts)
      // ملاحظة: هذا سيكاش أيضاً offline.html — إذا تريدها تتحدث بسرعة خليها مستثناة (أسفل)
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },

      // 3) منع كاش للـ API (مهم إذا عندك بيانات تتغير)
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },

      // 4) (اختياري لكن أنصح) offline.html بدون كاش قوي حتى إذا حدثته يظهر مباشرة
      {
        source: "/offline.html",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },

  /**
   * ✅ PDF Worker
   * أنت حالياً فقط حذفت worker-loader، لكن إذا كودك يعتمد عليه لازم تعدله.
   * (هذا الجزء لا يكسر build لوحده)
   */
  webpack(config, { isServer }) {
    if (!isServer) {
      // شيل أي worker-loader قديم إذا كان موجود
      config.module.rules = config.module.rules.filter((rule) => {
        const use = rule && rule.use;
        const loader =
          typeof use === "object" && use && "loader" in use ? use.loader : null;
        return !(loader && String(loader).includes("worker-loader"));
      });
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
