// pages/api/admin/stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";

interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderWithDate {
  cart: CartItem[];
  total: number;
  createdAt: string | Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "❌ Method Not Allowed" });
  }

  try {
    await dbConnect();

    const productsCount = await Product.countDocuments();
    const orders = await Order.find().lean() as OrderWithDate[];
    const ordersCount = orders.length;

    // 🔹 حساب أرباح اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter((order) => new Date(order.createdAt) >= today)
      .reduce((sum, order) => sum + order.total, 0);

    // 🔹 أكثر منتج مبيعاً
    const productSales: Record<string, number> = {};
    for (const order of orders) {
      for (const item of order.cart) {
        const productName = item.name.trim();
        productSales[productName] = (productSales[productName] || 0) + item.quantity;
      }
    }

    const [topProductName = "-", topProductQty = 0] =
      Object.entries(productSales).sort((a, b) => b[1] - a[1])[0] || [];

    // 🔹 أرباح آخر 7 أيام
    const revenueMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      revenueMap[key] = 0;
    }

    for (const order of orders) {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
      if (revenueMap[dateKey] !== undefined) {
        revenueMap[dateKey] += order.total;
      }
    }

    const dailyRevenue = Object.entries(revenueMap).map(([date, total]) => ({
      date,
      total,
    }));

    return res.status(200).json({
      success: true,
      productsCount,
      ordersCount,
      todayRevenue,
      topProduct: { name: topProductName, quantity: topProductQty },
      dailyRevenue,
    });
  } catch (error: any) {
    console.error("⛔ Error in /api/admin/stats:", error.message);
    return res.status(500).json({
      success: false,
      message: "⚠️ حدث خطأ أثناء جلب الإحصائيات",
      error: error.message,
    });
  }
}
