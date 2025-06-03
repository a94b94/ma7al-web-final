// /pages/api/notifications/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { id } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "📛 معرف الإشعار مطلوب" });
  }

  try {
    await connectToDatabase();

    const deleted = await NotificationModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "🚫 الإشعار غير موجود أو تم حذفه مسبقاً" });
    }

    return res.status(200).json({ success: true, message: "✅ تم حذف الإشعار" });
  } catch (err) {
    console.error("❌ خطأ أثناء حذف الإشعار:", err);
    return res.status(500).json({ error: "🚨 حدث خطأ أثناء حذف الإشعار" });
  }
}
