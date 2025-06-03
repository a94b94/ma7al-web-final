import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { phone } = req.body;

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "📱 رقم الهاتف مطلوب" });
  }

  try {
    await connectToDatabase();

    const result = await NotificationModel.deleteMany({ userId: phone });

    return res.status(200).json({
      success: true,
      message: `🧹 تم حذف ${result.deletedCount} إشعارًا بنجاح`,
    });
  } catch (err) {
    console.error("❌ خطأ أثناء حذف الإشعارات:", err);
    return res.status(500).json({ error: "🚨 حدث خطأ أثناء مسح الإشعارات" });
  }
}
