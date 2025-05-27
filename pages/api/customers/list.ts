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
    const orders = await Order.find({}, "customerName phone total").lean();

    const customerMap: {
      [phone: string]: {
        name: string;
        phone: string;
        orderCount: number;
        totalSpent: number;
      };
    } = {};

    for (const order of orders) {
      const phone = order.phone;
      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: order.customerName || "زبون",
          phone,
          orderCount: 0,
          totalSpent: 0,
        };
      }
      customerMap[phone].orderCount += 1;
      customerMap[phone].totalSpent += order.total || 0;
    }

    const customerList = Object.values(customerMap).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );

    return res.status(200).json(customerList);
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الزبائن:", err);
    return res.status(500).json({ error: "❌ حدث خطأ أثناء تحميل الزبائن" });
  }
}
