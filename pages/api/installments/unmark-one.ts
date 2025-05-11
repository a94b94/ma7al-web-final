import { NextApiRequest, NextApiResponse } from "next";
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
      return res.status(400).json({ success: false, message: "بيانات ناقصة" });
    }

    const order = await Order.findById(orderId);
    if (!order || !order.installments || !order.installments[installmentIndex]) {
      return res.status(404).json({ success: false, message: "لم يتم العثور على الطلب أو القسط" });
    }

    const installment = order.installments[installmentIndex];
    if (!installment.paid) {
      return res.status(400).json({ success: false, message: "القسط غير مدفوع أصلًا" });
    }

    // إعادة تعيين القسط كغير مدفوع
    installment.paid = false;
    installment.paidAt = undefined;

    // خصم المبلغ من المدفوع الكلي
    order.paid = (order.paid || 0) - installment.amount;

    // تحديث حالة الطلب إذا لم يعد مكتمل
    if (order.paid < order.total) {
      order.status = "قيد المعالجة";
    }

    await order.save();

    res.status(200).json({ success: true, amount: installment.amount });
  } catch (err) {
    console.error("❌ خطأ أثناء إلغاء القسط:", err);
    res.status(500).json({ success: false, message: "فشل في الإلغاء" });
  }
}
