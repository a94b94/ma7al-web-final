// /pages/api/notifications/mark-read-by-phone.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { phone } = req.body;

  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    return res.status(400).json({ error: "📱 رقم الهاتف مطلوب بشكل صحيح" });
  }

  try {
    await connectDB();

    const result = await NotificationModel.updateMany(
      { userId: phone, seen: false },
      {
        $set: {
          seen: true,
          updatedAt: new Date(), // ✅ اختياري لتحديث الزمن
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `✅ تم تعليم ${result.modifiedCount} إشعار كمقروء للرقم ${phone}`,
    });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث الإشعارات:", err);
    return res.status(500).json({ error: "🚨 حدث خطأ أثناء تحديث حالة الإشعارات" });
  }
}
