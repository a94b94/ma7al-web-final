import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, installmentIndex } = req.body;

  if (!orderId || installmentIndex === undefined) {
    return res.status(400).json({ error: "البيانات ناقصة" });
  }

  await dbConnect();

  try {
    const order = await Order.findById(orderId);
    if (!order || !order.installments || !order.installments[installmentIndex]) {
      return res.status(404).json({ error: "الطلب أو القسط غير موجود" });
    }

    // تحديث القسط المحدد
    order.installments[installmentIndex].paid = true;
    order.installments[installmentIndex].paidAt = new Date();

    // تحديث المبلغ المدفوع
    const amount = order.installments[installmentIndex].amount;
    order.paid = (order.paid || 0) + amount;
    order.remaining = Math.max((order.remaining || 0) - amount, 0);

    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error marking installment paid:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء تحديث القسط" });
  }
}
