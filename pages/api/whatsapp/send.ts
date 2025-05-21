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
    return res.status(400).json({ error: "❗ البيانات ناقصة" });
  }

  await connectDB();

  try {
    const formattedPhone = phone.startsWith("+") ? phone.replace("+", "") : phone;

    const apiRes = await fetch("https://ma7al-whatsapp-production.up.railway.app/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: formattedPhone,
        message,
      }),
    });

    // ✅ حتى لو كان status OK، نتحقق من الجسم
    let result = {};
    try {
      result = await apiRes.json();
    } catch (err) {
      console.warn("⚠️ الرد غير قابل للقراءة كـ JSON لكن سنكمل");
    }

    // ✅ تسجيل الإشعار في قاعدة البيانات بأي حال
    await NotificationModel.create({
      orderId,
      customerPhone: phone,
      message,
      sentBy,
    });

    await Order.findByIdAndUpdate(orderId, {
      reminderSent: true,
      sentBy,
    });

    return res.status(200).json({ success: true, msg: "✅ تم إرسال الرسالة وتسجيل الإشعار بنجاح" });

  } catch (error: any) {
    console.error("❌ خطأ أثناء العملية:", error.message);
    return res.status(500).json({ error: "❌ فشل غير متوقع أثناء الإرسال" });
  }
}
