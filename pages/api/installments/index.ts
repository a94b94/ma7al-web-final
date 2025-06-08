import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const orders = await Order.find({ type: "installment", dueDate: { $exists: true } })
      .sort({ dueDate: 1 })
      .select(
        "customerName customerPhone phone total paid dueDate discount downPayment installmentsCount storeName sentBy status reminderSent"
      )
      .lean();

    const safeOrders = orders.map((order: any) => {
      const paid = typeof order.paid === "number" ? order.paid : 0;
      const discount = typeof order.discount === "number" ? order.discount : 0;
      const downPayment = typeof order.downPayment === "number" ? order.downPayment : 0;
      const total = typeof order.total === "number" ? order.total : 0;

      const remaining = total - paid - discount - downPayment;

      return {
        ...order,
        paid,
        discount,
        downPayment,
        reminderSent: order.reminderSent || false,
        sentBy: order.sentBy || "مشرف",
        remaining: remaining > 0 ? remaining : 0,
        dueDate: order.dueDate ? new Date(order.dueDate).toISOString() : null,
      };
    });

    res.status(200).json(safeOrders);
  } catch (err) {
    console.error("❌ فشل في جلب الأقساط:", err);
    res.status(500).json({ message: "فشل في جلب الأقساط" });
  }
}
