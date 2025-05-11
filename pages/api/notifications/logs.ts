import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { orderId } = req.query;

  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({ success: false, message: "رقم الطلب مفقود" });
  }

  try {
    const logs = await NotificationModel.find({ orderId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب السجل:", error);
    return res.status(500).json({ success: false, message: "فشل في جلب سجل التذكيرات" });
  }
}
