import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phone } = req.query;

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "📱 رقم الهاتف مطلوب" });
  }

  try {
    await connectToDatabase();

    const notifications = await NotificationModel.find({ userId: phone })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الإشعارات:", err);
    return res.status(500).json({ success: false, message: "حدث خطأ داخلي" });
  }
}
