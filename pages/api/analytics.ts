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
      toDate.setDate(toDate.getDate() + 1); // لاحتساب اليوم الأخير ضمن الفلترة
      dateFilter.$lte = toDate;
    }

    const orders = await Order.find(
      Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}
    );
    const products = await Product.find();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const uniqueCustomers = new Set(orders.map((o) => o.phone)).size;

    // 🔝 أكثر المنتجات مبيعًا
    const productSalesMap = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.cart) {
        productSalesMap.set(item.name, (productSalesMap.get(item.name) || 0) + item.quantity);
      }
    }

    const topProducts = [...productSalesMap.entries()]
      .map(([name, totalSold]) => ({ name, totalSold }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    // 📊 المبيعات الشهرية
    const monthlySalesMap = new Map<string, number>();
    for (const order of orders) {
      const month = new Date(order.createdAt!).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlySalesMap.set(month, (monthlySalesMap.get(month) || 0) + order.total);
    }

    const monthlySales = [...monthlySalesMap.entries()].map(([month, total]) => ({ month, total }));

    // 🧩 توزيع المبيعات حسب الفئة
    const categorySalesMap = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.cart) {
        const product = products.find((p) => (p._id as any).toString() === item.productId);
        const category = product?.category || "غير مصنّف";
        const saleAmount = item.quantity * item.price;
        categorySalesMap.set(category, (categorySalesMap.get(category) || 0) + saleAmount);
      }
    }

    const salesByCategory = [...categorySalesMap.entries()].map(([category, total]) => ({ category, total }));

    return res.status(200).json({
      totalOrders,
      totalRevenue,
      uniqueCustomers,
      topProducts,
      monthlySales,
      salesByCategory,
    });
  } catch (err) {
    console.error("❌ Analytics Error:", err);
    return res.status(500).json({ error: "❌ خطأ أثناء تحميل البيانات" });
  }
}
