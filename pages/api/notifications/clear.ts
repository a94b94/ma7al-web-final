// pages/api/notifications/clear.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  const { phone } = req.body;

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ success: false, error: "📱 رقم الهاتف غير صالح أو غير موجود" });
  }

  try {
    await connectToDatabase();

    const result = await NotificationModel.deleteMany({ userId: phone });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `🧹 تم حذف ${result.deletedCount} من الإشعارات المرتبطة بالرقم ${phone}`,
    });
  } catch (err) {
    console.error("❌ خطأ أثناء حذف الإشعارات:", err);
    return res.status(500).json({
      success: false,
      error: "🚨 حدث خطأ داخلي أثناء مسح الإشعارات",
    });
  }
}
