// /pages/api/notifications/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import NotificationModel from "@/models/Notification";
import { connectDB } from "@/lib/mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  try {
    await connectDB();

    const { userId } = req.query;

    // ⚠️ التحقق من صلاحية userId (إن وجد)
    let filter: any = {};
    if (userId && typeof userId === "string") {
      filter.userId = userId;
    }

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .populate("orderId");

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب الإشعارات:", error);
    return res.status(500).json({
      success: false,
      error: "🚨 حدث خطأ أثناء جلب الإشعارات",
    });
  }
}
