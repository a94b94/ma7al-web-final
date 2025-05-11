import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const orders = await Order.find({ type: "installment" })
      .sort({ dueDate: 1 })
      .select(
        "customerName customerPhone phone total paid dueDate discount downPayment installmentsCount storeName sentBy status reminderSent"
      )
      .lean();

    // تأمين الحقول المهمة الافتراضية في حالة غيابها
    const safeOrders = orders.map((order: any) => ({
      ...order,
      paid: order.paid || 0,
      discount: order.discount || 0,
      reminderSent: order.reminderSent || false,
      sentBy: order.sentBy || "مشرف",
    }));

    res.status(200).json(safeOrders);
  } catch (err) {
    console.error("❌ فشل في جلب الأقساط:", err);
    res.status(500).json({ message: "فشل في جلب الأقساط" });
  }
}
