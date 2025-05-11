import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "الرقم غير موجود" });
    }

    const order = await Order.findById(orderId);

    if (!order || order.type !== "installment" || !order.installments || order.installments.length === 0) {
      return res.status(404).json({ success: false, message: "طلب تقسيط غير صالح" });
    }

    const unpaidInstallment = order.installments.find((i) => !i.paid);
    if (!unpaidInstallment) {
      return res.status(400).json({ success: false, message: "كل الأقساط مدفوعة بالفعل" });
    }

    unpaidInstallment.paid = true;
    unpaidInstallment.paidAt = new Date();

    const updatedPaid = (order.paid || 0) + unpaidInstallment.amount;
    order.paid = updatedPaid;

    if (updatedPaid >= order.total) {
      order.status = "مكتمل";
    }

    await order.save();

    res.status(200).json({ success: true, amount: unpaidInstallment.amount });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث القسط:", err);
    res.status(500).json({ success: false, message: "فشل في تحديث القسط" });
  }
}
