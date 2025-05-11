import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { orderId, installmentIndex } = req.body;

    if (!orderId || typeof installmentIndex !== "number") {
      return res.status(400).json({ success: false, message: "بيانات غير مكتملة" });
    }

    const order = await Order.findById(orderId);

    if (!order || !order.installments || !order.installments[installmentIndex]) {
      return res.status(404).json({ success: false, message: "القسط غير موجود" });
    }

    const installment = order.installments[installmentIndex];

    if (!installment.paid) {
      return res.status(400).json({ success: false, message: "القسط غير مدفوع أصلًا" });
    }

    installment.paid = false;
    installment.paidAt = undefined;
    order.paid = (order.paid || 0) - installment.amount;

    order.status = "قيد المعالجة"; // ترجع للحالة العادية

    await order.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ خطأ أثناء إلغاء الدفع:", error);
    return res.status(500).json({ success: false, message: "فشل في إلغاء الدفع" });
  }
}
