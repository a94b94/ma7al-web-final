import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    const { orderId, installmentIndex } = req.body;

    if (!orderId || installmentIndex === undefined) {
      return res.status(400).json({ success: false, message: "بيانات غير مكتملة" });
    }

    const order = await Order.findById(orderId);
    if (!order || !order.installments || !order.installments[installmentIndex]) {
      return res.status(404).json({ success: false, message: "الطلب أو القسط غير موجود" });
    }

    const installment = order.installments[installmentIndex];
    if (installment.paid) {
      return res.status(400).json({ success: false, message: "هذا القسط مدفوع مسبقًا" });
    }

    // تحديث القسط
    installment.paid = true;
    installment.paidAt = new Date();

    // تحديث المبالغ
    order.paid = (order.paid || 0) + installment.amount;
    order.remaining = order.total - order.paid;

    // تحديث الحالة إذا تم الدفع الكامل
    if (order.paid >= order.total) {
      order.status = "مكتمل";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      paid: order.paid,
      remaining: order.remaining,
      paidAt: installment.paidAt,
      amount: installment.amount,
    });
  } catch (err) {
    console.error("❌ خطأ في حفظ القسط:", err);
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء الحفظ" });
  }
}
