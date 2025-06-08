// pages/api/your-endpoint.ts
import type { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "@/lib/rateLimit";
import { connectDB } from "@/lib/mongoose";

// ✅ إعداد rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // كل دقيقة
  uniqueTokenPerInterval: 500,
  max: 10, // الحد الأقصى للطلبات لكل IP
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🔍 استخراج عنوان IP من الهيدر أو سوكيت
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket.remoteAddress || "unknown";

  try {
    // 🛡️ تطبيق rate limit
    await limiter.check(res, 10, ip.toString());

    // 🔌 الاتصال بقاعدة البيانات
    await connectDB();

    // 🪵 تسجيل الطلب
    console.log(`[${new Date().toISOString()}] 🔐 API Request from IP: ${ip}`);

    // ✅ الرد
    return res.status(200).json({ message: "✅ نجح الطلب!" });
  } catch (err: any) {
    console.warn(`[RateLimit] ⚠️ IP ${ip} تجاوز الحد: ${err.message}`);
    return res.status(429).json({ error: err.message || "❗ عدد الطلبات تجاوز الحد المسموح." });
  }
}
