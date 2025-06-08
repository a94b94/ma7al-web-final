// /pages/api/notifications/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import NotificationModel from "@/models/Notification";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  const { id } = req.body;

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "📛 معرف الإشعار غير صالح أو مفقود" });
  }

  try {
    await connectToDatabase();

    const deleted = await NotificationModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "🚫 الإشعار غير موجود أو تم حذفه مسبقاً" });
    }

    return res.status(200).json({
      success: true,
      message: "✅ تم حذف الإشعار بنجاح",
      deletedId: id,
    });
  } catch (err) {
    console.error("❌ خطأ أثناء حذف الإشعار:", err);
    return res.status(500).json({
      success: false,
      error: "🚨 حدث خطأ أثناء حذف الإشعار",
    });
  }
}
