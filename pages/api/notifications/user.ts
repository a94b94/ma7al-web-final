// /pages/api/notifications/user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";
import rateLimit from "@/lib/rateLimit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
  max: 10,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous";
    await limiter.check(res, 10, String(token));
  } catch (err: any) {
    return res.status(429).json({ error: err.message || "تم تجاوز الحد المسموح للطلبات" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { phone, onlyUnread, type, limit } = req.query;

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "📱 رقم الهاتف مطلوب" });
  }

  try {
    await connectDB();

    const filter: Record<string, any> = { userId: phone };
    if (onlyUnread === "true") filter.seen = false;
    if (type && typeof type === "string") filter.type = type;

    const fetchLimit = parseInt(limit as string) || 20;

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(fetchLimit)
      .lean();

    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الإشعارات:", err);
    return res.status(500).json({ success: false, message: "⚠️ حدث خطأ داخلي أثناء جلب الإشعارات" });
  }
}
