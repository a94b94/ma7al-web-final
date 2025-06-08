import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const {
      orderId,
      customerPhone,
      message,
      sentBy,
      installmentIndex,
      type = "installment",
    } = req.body;

    // ✅ التحقق من الحقول المطلوبة
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "❌ معرّف الطلب غير صالح أو مفقود" });
    }

    if (!customerPhone || typeof customerPhone !== "string") {
      return res.status(400).json({ message: "❌ رقم الهاتف غير صالح" });
    }

    if (!message || !sentBy || installmentIndex === undefined) {
      return res.status(400).json({ message: "❌ بعض الحقول مفقودة" });
    }

    // ✅ إنشاء سجل التذكير
    const log = await NotificationModel.create({
      orderId,
      customerPhone,
      message,
      sentBy,
      installmentIndex,
      type,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, log });
  } catch (err) {
    console.error("❌ فشل في حفظ التذكير:", err);
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء حفظ التذكير" });
  }
}
