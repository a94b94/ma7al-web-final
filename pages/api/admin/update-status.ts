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

// 🟢 دالة إرسال رسالة واتساب
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
    return res.status(405).json({ error: "🚫 Method Not Allowed" });
  }

  try {
    const user = verifyToken(req);
    if (!user || !user.email) {
      return res.status(401).json({ error: "🚫 غير مصرح" });
    }

    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "❌ البيانات غير مكتملة" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "❌ حالة غير صالحة" });
    }

    await connectToDatabase();

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ error: "❌ الطلب غير موجود" });
    }

    // 🟡 إرسال رسالة حسب الحالة
    const statusMessages: Record<string, string> = {
      "بانتظار التأكيد": "طلبك قيد المراجعة ✅",
      "قيد المعالجة": "طلبك قيد المعالجة حاليًا 🛠️",
      "تم الشحن": "طلبك خرج للتوصيل 🚚",
      "تم التوصيل": "تم توصيل طلبك 🎉 شكراً لك",
      "مكتمل": "✅ تم إنهاء طلبك، نتمنى لك يوماً سعيداً!",
      "ملغي": "❌ تم إلغاء طلبك، يمكنك التواصل معنا للاستفسار.",
    };

    const phone = updatedOrder.phone?.trim();
    const message = statusMessages[status];

    if (phone && message) {
      await sendWhatsAppMessage(phone, message);
    }

    return res.status(200).json({
      success: true,
      message: "✅ تم تحديث الحالة وإرسال إشعار واتساب",
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error("⛔ فشل في تحديث الطلب:", err.message);
    return res.status(500).json({ error: "⚠️ حدث خطأ داخلي" });
  }
}
