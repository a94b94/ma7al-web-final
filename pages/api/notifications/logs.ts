// /pages/api/notifications/log.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "❌ Method Not Allowed" });
  }

  await connectDB();

  const { orderId } = req.query;

  if (!orderId || typeof orderId !== "string" || !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ success: false, message: "❌ رقم الطلب غير صالح" });
  }

  try {
    const logs = await NotificationModel.find({ orderId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب سجل التذكيرات:", error);
    return res.status(500).json({ success: false, message: "⚠️ فشل في جلب سجل التذكيرات" });
  }
}
