import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "رقم الفاتورة مفقود" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "لم يتم العثور على الطلب" });
    }

    const newPaid = order.total;
    const newRemaining = 0;

    await Order.findByIdAndUpdate(orderId, {
      paid: newPaid,
      remaining: newRemaining,
      status: "مكتمل",
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث حالة الدفع:", err);
    res.status(500).json({ success: false, message: "فشل في التحديث" });
  }
}
