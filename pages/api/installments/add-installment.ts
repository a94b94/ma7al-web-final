import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order, { IOrder } from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "رقم الطلب مفقود" });
    }

    const order = await Order.findById(orderId) as IOrder;

    if (!order) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    }

    if (order.type !== "installment") {
      return res.status(400).json({ success: false, message: "الطلب ليس تقسيط" });
    }

    if (!order.installments || order.installments.length === 0) {
      return res.status(400).json({ success: false, message: "لا توجد أقساط مسجلة" });
    }

    const unpaidInstallment = order.installments.find((i) => !i.paid);

    if (!unpaidInstallment) {
      return res.status(400).json({ success: false, message: "كل الأقساط مدفوعة" });
    }

    unpaidInstallment.paid = true;
    unpaidInstallment.paidAt = new Date();

    order.paid = (order.paid || 0) + unpaidInstallment.amount;

    if (order.paid >= order.total) {
      order.status = "مكتمل";
    }

    await order.save();

    return res.status(200).json({ success: true, amount: unpaidInstallment.amount });
  } catch (error) {
    console.error("❌ خطأ أثناء إضافة القسط:", error);
    return res.status(500).json({ success: false, message: "فشل في إضافة القسط" });
  }
}
