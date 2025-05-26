// /pages/api/notifications/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "📛 معرف الإشعار مطلوب" });
  }

  try {
    await connectToDatabase();

    await NotificationModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ خطأ أثناء حذف الإشعار:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء الحذف" });
  }
}
