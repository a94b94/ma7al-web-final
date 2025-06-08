// lib/redis.ts
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("❌ متغير البيئة REDIS_URL غير معرف. تأكد من إضافته إلى .env أو Vercel.");
}

// ✅ إعداد خيارات أفضل للإنتاج
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 5, // تقليل المحاولات لتجنب انهيار السيرفر
  connectTimeout: 5000,     // مهلة الاتصال 5 ثواني
  lazyConnect: true,        // تأجيل الاتصال حتى يتم استخدامه فعليًا
  enableOfflineQueue: false // إيقاف التخزين المؤقت للأوامر أثناء انقطاع الاتصال
});

// ✅ اختبار الاتصال (مرة واحدة فقط أثناء التطوير)
if (process.env.NODE_ENV !== "production") {
  redis.connect()
    .then(() => console.log("✅ Redis متصل بنجاح"))
    .catch((err) => console.error("❌ فشل الاتصال بـ Redis:", err.message));
}

export default redis;
