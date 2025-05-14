import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
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

    // تحقق من البيانات
    if (!orderId || !customerPhone || !message || !sentBy || installmentIndex === undefined) {
      return res.status(400).json({ message: "❌ بعض الحقول مفقودة" });
    }

    // إنشاء سجل جديد
    await NotificationModel.create({
      orderId,
      customerPhone,
      message,
      sentBy,
      installmentIndex,
      type,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ فشل في حفظ التذكير:", err);
    res.status(500).json({ success: false, message: "فشل في حفظ التذكير" });
  }
}
