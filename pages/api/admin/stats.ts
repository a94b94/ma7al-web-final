import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";

// ✅ نُعرّف نوع الطلب المتوقع
interface OrderWithDate {
  cart: { name: string; quantity: number; price: number }[];
  total: number;
  createdAt: string | Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    await dbConnect();

    const productsCount = await Product.countDocuments();
    const orders = await Order.find().lean() as unknown as OrderWithDate[]; // ✅ حل التحذير

    const ordersCount = orders.length;

    // 🔹 أرباح اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenue = orders
      .filter((order) => new Date(order.createdAt) >= today)
      .reduce((sum, order) => sum + order.total, 0);

    // 🔹 أكثر منتج مبيعاً
    const productSales: { [name: string]: number } = {};
    for (const order of orders) {
      for (const item of order.cart) {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      }
    }

    const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0] || ["-", 0];

    // 🔹 تحليلات 7 أيام
    const dailyRevenueMap: { [date: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      dailyRevenueMap[key] = 0;
    }

    for (const order of orders) {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
      if (dailyRevenueMap[dateKey] !== undefined) {
        dailyRevenueMap[dateKey] += order.total;
      }
    }

    const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, total]) => ({
      date,
      total,
    }));

    res.status(200).json({
      productsCount,
      ordersCount,
      todayRevenue,
      topProduct: { name: topProduct[0], quantity: topProduct[1] },
      dailyRevenue,
    });
  } catch (error: any) {
    console.error("⛔ Error in /api/admin/stats:", error.message);
    res.status(500).json({ error: "⚠️ حدث خطأ أثناء جلب الإحصائيات" });
  }
}
