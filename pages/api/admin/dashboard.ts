// pages/api/admin/analytics.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ تحقق من التوكن
    verifyToken(req);

    // ✅ الاتصال بقاعدة البيانات
    await connectToDatabase();

    // 🔹 حساب عدد الطلبات والمنتجات
    const [totalOrders, totalProducts] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments()
    ]);

    // 🔹 أحدث 4 طلبات
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    // 🔹 مجموع المبيعات
    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalSales = totalSalesAgg.length > 0 ? totalSalesAgg[0].total : 0;

    // 🔹 عدد المنتجات حسب الفئة
    const categoryStats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // ✅ الرد النهائي
    return res.status(200).json({
      success: true,
      totalOrders,
      totalProducts,
      totalSales,
      latestOrders,
      categoryStats,
    });

  } catch (err: any) {
    console.error("❌ خطأ في API Dashboard:", err.message);

    const statusCode = err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" ? 401 : 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "❌ حدث خطأ غير متوقع",
    });
  }
}
