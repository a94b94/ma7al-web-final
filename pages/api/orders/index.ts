// pages/api/orders/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  try {
    await dbConnect();

    const { phone, address, cart, total, storeId, paymentMethod } = req.body;

    // ✅ تحقق من الحقول المطلوبة
    if (!phone || !address || !Array.isArray(cart) || cart.length === 0 || !storeId || !paymentMethod) {
      return res.status(400).json({ success: false, error: "❗ جميع الحقول مطلوبة" });
    }

    // ✅ تحقق من تنسيق الرقم
    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: "📱 رقم الهاتف غير صالح" });
    }

    // ✅ تحقق من المبلغ
    if (typeof total !== "number" || total <= 0) {
      return res.status(400).json({ success: false, error: "💰 المبلغ الإجمالي غير صالح" });
    }

    // ✅ إنشاء الطلب
    const newOrder = await Order.create({
      phone,
      address,
      cart,
      total,
      storeId,
      paymentMethod,
      status: "جديد", // يمكنك لاحقًا تخصيص الحالات مثل: "قيد التنفيذ" - "مكتمل"
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    console.error("❌ Order creation error:", err.message || err);
    return res.status(500).json({ success: false, error: "🚨 فشل في إنشاء الطلب" });
  }
}
