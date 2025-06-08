// /pages/api/notifications/mark-read.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { userId } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "📱 userId مطلوب" });
  }

  try {
    await connectDB();

    const result = await NotificationModel.updateMany(
      { userId, seen: { $ne: true } },
      { $set: { seen: true } }
    );

    return res.status(200).json({
      success: true,
      message: `✅ تم تعليم ${result.modifiedCount} إشعار كمقروء`,
    });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث الإشعارات:", err);
    return res.status(500).json({ error: "🚨 حدث خطأ أثناء التحديث" });
  }
}
