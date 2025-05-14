import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phone } = req.body;

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "📱 رقم الهاتف مطلوب" });
  }

  try {
    await connectToDatabase();

    await NotificationModel.updateMany(
      { customerPhone: phone, seen: { $ne: true } },
      { $set: { seen: true } }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث الإشعارات:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء التحديث" });
  }
}
