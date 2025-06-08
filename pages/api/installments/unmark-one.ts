import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { orderId, installmentIndex } = req.body;

    // ✅ التحقق من صحة البيانات
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "رقم الفاتورة غير صالح" });
    }

    if (typeof installmentIndex !== "number") {
      return res.status(400).json({ success: false, message: "رقم القسط غير صالح" });
    }

    const order = await Order.findById(orderId);
    if (!order || !order.installments || !order.installments[installmentIndex]) {
      return res.status(404).json({ success: false, message: "الفاتورة أو القسط غير موجود" });
    }

    const installment = order.installments[installmentIndex];
    if (!installment.paid) {
      return res.status(400).json({ success: false, message: "هذا القسط غير مدفوع أصلًا" });
    }

    // ✅ إلغاء دفع القسط
    installment.paid = false;
    installment.paidAt = undefined;

    order.paid = Math.max((order.paid || 0) - installment.amount, 0);
    order.remaining = Math.max(order.total - order.paid, 0);
    order.status = "قيد المعالجة";

    await order.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ خطأ أثناء إلغاء دفع القسط:", error);
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء العملية" });
  }
}
