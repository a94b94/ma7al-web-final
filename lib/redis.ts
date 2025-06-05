// lib/redis.ts
import Redis from "ioredis";

// إنشاء العميل
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// اختبار الاتصال (اختياري - مفيد أثناء التطوير)
if (process.env.NODE_ENV !== "production") {
  redis
    .ping()
    .then(() => console.log("✅ Redis متصل بنجاح"))
    .catch((err) => console.error("❌ فشل الاتصال بـ Redis:", err.message));
}

export default redis;
