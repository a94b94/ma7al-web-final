import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const orders = await Order.find({ invoiceType: "installment" }).sort({ dueDate: 1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب الأقساط" });
  }
}
