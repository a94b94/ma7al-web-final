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

    await Order.findByIdAndUpdate(orderId, { reminderSent: true });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث حالة التذكير:", err);
    res.status(500).json({ success: false, message: "فشل في التحديث" });
  }
}
