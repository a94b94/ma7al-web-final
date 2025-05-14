// pages/api/your-endpoint.ts
import type { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "@/lib/rateLimit";
import { connectDB } from "@/lib/mongoose";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 دقيقة
  uniqueTokenPerInterval: 500,
  max: 10, // أقصى عدد طلبات في الدقيقة لكل IP
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").toString();

  try {
    // 🛡️ تطبيق rate limit
    await limiter.check(res, 10, ip);

    // 🔌 الاتصال بقاعدة البيانات
    await connectDB();

    // 🪵 تسجيل النشاط
    console.log(`[${new Date().toISOString()}] 🔐 API Request from: ${ip}`);

    return res.status(200).json({ message: "✅ نجح الطلب!" });
  } catch (err: any) {
    return res.status(429).json({ error: err.message || "❗ عدد الطلبات تجاوز الحد المسموح." });
  }
}
