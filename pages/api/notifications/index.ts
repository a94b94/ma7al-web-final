// /pages/api/notifications/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import NotificationModel from "@/models/Notification";
import { connectDB } from "@/lib/mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { userId } = req.query;

  try {
    // ⚠️ تأكد من تمرير userId من الواجهة
    const filter = userId ? { userId } : {};

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .populate("orderId");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ خطأ في جلب الإشعارات:", error);
    res.status(500).json({ message: "حدث خطأ في جلب الإشعارات" });
  }
}
