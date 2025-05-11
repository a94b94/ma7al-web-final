import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phone, message, orderId, sentBy } = req.body;

  if (!phone || !message || !orderId || !sentBy) {
    return res.status(400).json({ error: "البيانات ناقصة" });
  }

  await connectDB();

  try {
    // ✅ المسار الصحيح
    const apiRes = await fetch("https://ma7al-whatsapp-production.up.railway.app/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone.startsWith("+") ? phone.replace("+", "") : phone,
        message,
      }),
    });

    const result = await apiRes.json();
    if (!result.success) throw new Error("فشل في الإرسال");

    // ✅ تسجيل الإشعار
    await NotificationModel.create({
      orderId,
      customerPhone: phone,
      message,
      sentBy,
    });

    // ✅ تحديث الطلب
    await Order.findByIdAndUpdate(orderId, {
      reminderSent: true,
      sentBy,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌", error);
    res.status(500).json({ error: "❌ فشل في إرسال الرسالة" });
  }
}
