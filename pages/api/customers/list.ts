// ✅ ملف: /pages/api/customers/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

interface CustomerData {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    await connectDB();

    const orders = await Order.find({}, "customerName phone total").lean();

    const customerMap: Record<string, CustomerData> = {};

    for (const order of orders) {
      const phone = order.phone;
      if (!phone) continue;

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

    return res.status(200).json({
      success: true,
      message: "✅ تم تحميل الزبائن بنجاح",
      customers: customerList,
    });
  } catch (err: any) {
    console.error("❌ خطأ أثناء جلب الزبائن:", err.message);
    return res.status(500).json({
      success: false,
      error: "❌ حدث خطأ أثناء تحميل الزبائن",
      message: err.message,
    });
  }
}
