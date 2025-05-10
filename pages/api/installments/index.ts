import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order"; // ✅ استخدم default import

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const orders = await Order.find({ type: "installment" }).sort({ dueDate: 1 }); // ✅ تأكد من استخدام type وليس invoiceType
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب الأقساط" });
  }
}
