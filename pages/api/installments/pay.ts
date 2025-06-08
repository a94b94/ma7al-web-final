import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, installmentIndex } = req.body;

  if (!orderId || installmentIndex === undefined || !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: "البيانات ناقصة أو معرّف غير صالح" });
  }

  await dbConnect();

  try {
    const order = await Order.findById(orderId);
    if (!order || !Array.isArray(order.installments) || !order.installments[installmentIndex]) {
      return res.status(404).json({ error: "الطلب أو القسط غير موجود" });
    }

    const installment = order.installments[installmentIndex];
    if (installment.paid) {
      return res.status(400).json({ error: "هذا القسط مدفوع مسبقًا" });
    }

    // تحديث حالة القسط
    installment.paid = true;
    installment.paidAt = new Date();

    // تحديث إجمالي المدفوع والمتبقي
    const amount = installment.amount;
    order.paid = (order.paid || 0) + amount;
    order.remaining = Math.max((order.total || 0) - order.paid, 0);

    // تحديث الحالة العامة إذا تم دفع كل الأقساط
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
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث القسط:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء تحديث القسط" });
  }
}
