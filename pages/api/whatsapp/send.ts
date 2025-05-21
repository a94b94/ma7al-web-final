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

    // ✅ إرسال الرسالة إلى سيرفر واتساب
    const apiRes = await fetch("https://ma7al-whatsapp-production.up.railway.app/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: formattedPhone,
        message,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("❌ فشل الاتصال بسيرفر واتساب:", errText);
      return res.status(500).json({ error: "فشل الاتصال بسيرفر الواتساب" });
    }

    let result;
    try {
      result = await apiRes.json();
    } catch (parseErr) {
      console.error("❌ فشل في تحليل رد السيرفر:", parseErr);
      return res.status(500).json({ error: "الرد من السيرفر غير قابل للقراءة (Invalid JSON)" });
    }

    if (!result.success) {
      console.error("❌ السيرفر أجاب بدون success:", result);
      return res.status(500).json({ error: "فشل في إرسال الرسالة (الرد من API غير ناجح)" });
    }

    // ✅ حفظ الإشعار في قاعدة البيانات
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

    return res.status(200).json({ success: true, msg: "✅ تم الإرسال بنجاح" });

  } catch (error: any) {
    console.error("❌ خطأ عام أثناء العملية:", error);
    return res.status(500).json({ error: "❌ حدث خطأ أثناء محاولة إرسال الرسالة" });
  }
}
