// /pages/api/customers/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();

  try {
    const orders = await Order.find({}, "customerName phone").lean();

    const unique = new Map();
    for (const order of orders) {
      if (!unique.has(order.phone)) {
        unique.set(order.phone, {
          name: order.customerName || "زبون",
          phone: order.phone,
        });
      }
    }

    return res.status(200).json(Array.from(unique.values()));
  } catch (err) {
    return res.status(500).json({ error: "❌ خطأ في جلب الزبائن" });
  }
}
