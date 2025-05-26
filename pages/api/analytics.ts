// /pages/api/analytics.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();

  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from as string) : null;
    const toDate = to ? new Date(to as string) : null;

    const dateFilter: any = {};
    if (fromDate) dateFilter.$gte = fromDate;
    if (toDate) {
      toDate.setDate(toDate.getDate() + 1);
      dateFilter.$lte = toDate;
    }

    const orders = await Order.find(
      Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}
    );
    const products = await Product.find();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const uniqueCustomers = new Set(orders.map((o) => o.phone)).size;

    const productSales: { [key: string]: number } = {};
    for (const order of orders) {
      for (const item of order.cart) {
        if (!productSales[item.name]) productSales[item.name] = 0;
        productSales[item.name] += item.quantity;
      }
    }

    const topProducts = Object.entries(productSales)
      .map(([name, totalSold]) => ({ name, totalSold }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    const monthlyMap: { [key: string]: number } = {};
    for (const order of orders) {
      const month = new Date(order.createdAt!).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyMap[month]) monthlyMap[month] = 0;
      monthlyMap[month] += order.total;
    }
    const monthlySales = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));

    const categoryMap: { [key: string]: number } = {};
    for (const order of orders) {
      for (const item of order.cart) {
        const prod = products.find((p) => (p._id as any).toString() === item.productId);
        const category = prod?.category || "غير مصنّف";
        if (!categoryMap[category]) categoryMap[category] = 0;
        categoryMap[category] += item.quantity * item.price;
      }
    }
    const salesByCategory = Object.entries(categoryMap).map(([category, total]) => ({ category, total }));

    return res.status(200).json({
      totalOrders,
      totalRevenue,
      uniqueCustomers,
      topProducts,
      monthlySales,
      salesByCategory,
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    return res.status(500).json({ error: "خطأ أثناء تحميل البيانات" });
  }
}
