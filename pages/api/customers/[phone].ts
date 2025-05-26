// /pages/api/customers/[phone].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();
  const { phone } = req.query;

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "📞 رقم الهاتف غير صالح" });
  }

  try {
    const orders = await Order.find({ phone });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "لم يتم العثور على بيانات لهذا الزبون" });
    }

    const firstOrder = orders[0];
    const name = firstOrder.customerName || "زبون";
    const address = firstOrder.address || "غير محدد";

    const result = {
      name,
      phone,
      address,
      orders: orders.map((o) => ({
        _id: o._id,
        total: o.total,
        paid: o.paid || 0,
        status: o.status,
        createdAt: o.createdAt,
        dueDate: o.dueDate,
      })),
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ خطأ أثناء جلب بيانات الزبون:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
}
