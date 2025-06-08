import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order, { IOrder } from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "❌ Method Not Allowed" });
  }

  try {
    await connectDB();

    const { orderId } = req.body;

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ success: false, message: "❗ رقم الطلب غير صالح أو مفقود" });
    }

    const order = await Order.findById(orderId) as IOrder;

    if (!order) {
      return res.status(404).json({ success: false, message: "❌ الطلب غير موجود" });
    }

    if (order.type !== "installment") {
      return res.status(400).json({ success: false, message: "⚠️ هذا الطلب ليس من نوع تقسيط" });
    }

    if (!Array.isArray(order.installments) || order.installments.length === 0) {
      return res.status(400).json({ success: false, message: "🚫 لا توجد أقساط مسجلة على هذا الطلب" });
    }

    // ✅ البحث عن أول قسط غير مدفوع بترتيب التاريخ
    const unpaidInstallment = order.installments.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ).find((i) => !i.paid);

    if (!unpaidInstallment) {
      return res.status(400).json({ success: false, message: "✅ كل الأقساط مدفوعة مسبقًا" });
    }

    // ✅ تحديث بيانات القسط
    unpaidInstallment.paid = true;
    unpaidInstallment.paidAt = new Date();

    order.paid = (order.paid || 0) + unpaidInstallment.amount;

    if (order.paid >= order.total) {
      order.status = "مكتمل";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "✅ تم تسجيل دفع القسط بنجاح",
      amount: unpaidInstallment.amount,
      paidAt: unpaidInstallment.paidAt,
    });

  } catch (error: any) {
    console.error("❌ خطأ أثناء تسجيل القسط:", error.message);
    return res.status(500).json({ success: false, message: "⚠️ فشل في تسجيل القسط", error: error.message });
  }
}
