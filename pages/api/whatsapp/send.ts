// pages/api/whatsapp/send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { phone, message, orderId, sentBy, notificationType = "تذكير" } = req.body;

  if (!phone || !message || !orderId || !sentBy) {
    return res.status(400).json({ error: "❗ البيانات ناقصة: تأكد من وجود الهاتف، الرسالة، الطلب، والمرسل" });
  }

  await connectDB();

  try {
    const formattedPhone = phone.startsWith("+") ? phone.replace("+", "") : phone;

    const response = await fetch("https://ma7al-whatsapp-production.up.railway.app/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: formattedPhone, message }),
    });

    let apiResult: any = {};
    try {
      apiResult = await response.json();
    } catch (err) {
      console.warn("⚠️ الرد غير قابل للقراءة كـ JSON، سنكمل على أي حال");
    }

    const success = apiResult?.status === true;

    // ✅ تسجيل الإشعار مع نوعه
    await NotificationModel.create({
      orderId,
      customerPhone: phone,
      message,
      sentBy,
      notificationType, // ✅ النوع الجديد
      sentAt: new Date(),
      success,
    });

    // ✅ تحديث حالة الطلب إذا تم الإرسال بنجاح
    if (success) {
      await Order.findByIdAndUpdate(orderId, {
        reminderSent: true,
        sentBy,
      });
    }

    return res.status(200).json({
      success: true,
      message: success ? "✅ تم إرسال الرسالة وتسجيل الإشعار" : "⚠️ تم تسجيل الإشعار لكن فشل إرسال الرسالة",
      apiResult,
    });
  } catch (error: any) {
    console.error("❌ خطأ أثناء إرسال الرسالة:", error);
    return res.status(500).json({ error: "❌ فشل داخلي أثناء معالجة الطلب", details: error.message });
  }
}
