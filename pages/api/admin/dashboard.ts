import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    verifyToken(req); // ✅ تحقق من التوكن
    await connectToDatabase(); // ✅ الاتصال بقاعدة البيانات

    // 🔹 جلب البيانات منفصلة لتجنب خطأ التايب
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const latestOrders = await Order.find().sort({ createdAt: -1 }).limit(4).lean();

    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    const categoryStats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // ✅ الرد بالبيانات
    res.status(200).json({
      totalOrders,
      totalProducts,
      totalSales,
      latestOrders,
      categoryStats,
    });

  } catch (err: any) {
    console.error("❌ خطأ في API Dashboard:", err);
    res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
