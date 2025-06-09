// lib/redis.ts
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("❌ متغير البيئة REDIS_URL غير معرف. تأكد من إضافته إلى .env أو Vercel.");
}

const redis = new Redis(REDIS_URL, {
  tls: {}, // 🔒 مطلوب لـ Upstash ويدعم الاتصال الآمن
  maxRetriesPerRequest: 5,
  connectTimeout: 5000,
  lazyConnect: true,
  enableOfflineQueue: false,
});

// ✅ اختبار الاتصال في بيئة التطوير فقط
if (process.env.NODE_ENV !== "production") {
  redis.connect()
    .then(() => console.log("✅ Redis متصل بنجاح"))
    .catch((err) => console.error("❌ فشل الاتصال بـ Redis:", err.message));
}

redis.on("error", (err) => {
  console.error("❌ خطأ في Redis:", err.message);
});

export default redis;
