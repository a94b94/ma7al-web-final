import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { Order } from "@/models/Order";
import { Notification } from "@/models/Notification";
import { connectDB } from "@/lib/mongoose"; // أو عدل المسار حسب مشروعك

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate("orderId");

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في جلب الإشعارات" });
  }
}
