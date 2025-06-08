// pages/api/orders/update-status.ts

import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

const allowedStatuses = [
  "بانتظار التأكيد",
  "قيد المعالجة",
  "تم الشحن",
  "تم التوصيل",
  "مكتمل",
  "ملغي",
];

// 🟢 إرسال رسالة واتساب
async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const res = await fetch("https://ma7al-whatsapp-production.up.railway.app/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.replace("+", ""), message }),
    });

    const result = await res.json();
    return result.success;
  } catch (error) {
    console.error("❌ فشل إرسال واتساب:", error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, message: "🚫 الطريقة غير مدعومة" });
  }

  try {
    // ✅ تحقق من التوكن
    let user;
    try {
      user = verifyToken(req);
    } catch (err) {
      return res.status(401).json({ success: false, message: "🚫 توكن غير صالح أو مفقود" });
    }

    if (!user || !user.email) {
      return res.status(401).json({ success: false, message: "🚫 غير مصرح" });
    }

    const { id, status } = req.body;

    if (!id || typeof id !== "string" || !status || typeof status !== "string") {
      return res.status(400).json({ success: false, message: "❌ البيانات غير مكتملة أو غير صحيحة" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "❌ حالة غير معتمدة" });
    }

    await connectToDatabase();

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "❌ الطلب غير موجود" });
    }

    // 🟡 رسائل الحالة
    const statusMessages: Record<string, string> = {
      "بانتظار التأكيد": "طلبك قيد المراجعة ✅",
      "قيد المعالجة": "طلبك قيد المعالجة حاليًا 🛠️",
      "تم الشحن": "طلبك خرج للتوصيل 🚚",
      "تم التوصيل": "تم توصيل طلبك 🎉 شكراً لك",
      "مكتمل": "✅ تم إنهاء طلبك، نتمنى لك يوماً سعيداً!",
      "ملغي": "❌ تم إلغاء طلبك، يمكنك التواصل معنا للاستفسار.",
    };

    const phone = updatedOrder.phone?.toString().trim();
    const message = statusMessages[status];

    if (phone && message) {
      const sent = await sendWhatsAppMessage(phone, message);
      if (!sent) {
        console.warn("⚠️ لم يتم إرسال إشعار واتساب بنجاح");
      }
    }

    return res.status(200).json({
      success: true,
      message: "✅ تم تحديث الحالة" + (phone ? " وإرسال إشعار واتساب" : ""),
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error("⛔ خطأ داخلي:", err.message);
    return res.status(500).json({ success: false, message: "⚠️ حدث خطأ داخلي", error: err.message });
  }
}
