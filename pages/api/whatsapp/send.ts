import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";

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
    const apiRes = await fetch("http://localhost:5000/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone.startsWith("+") ? phone.replace("+", "") : phone,
        message,
      }),
    });

    const result = await apiRes.json();
    if (!result.status) throw new Error("فشل في الإرسال");

    // ✅ تسجيل الإشعار
    await NotificationModel.create({
      orderId,
      customerPhone: phone,
      message,
      sentBy,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "❌ فشل في إرسال الرسالة" });
  }
}
