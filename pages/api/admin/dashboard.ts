// FILE: pages/api/admin/dashboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ تحقق من التوكن (من الكوكيز أو الهيدر حسب ما مهيأ عندك)
    verifyToken(req);

    // ✅ الاتصال بقاعدة البيانات
    await connectToDatabase();

    // ➕ لو عندك storeId حالي (من التوكن) تقدر تطلعه هنانا:
    // const { storeId } = (req as any).user || {};
    // وتضيفه للفلترة بكل الاستعلامات: { ...(storeId && { storeId }) }

    // 🕒 حدود اليوم (لبند "مبيعات اليوم")
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 🔹 حساب عدد الطلبات والمنتجات + الحالات
    const [
      totalOrders,
      totalProducts,
      pendingOrders,
      completedOrders,
      canceledOrders,
    ] = await Promise.all([
      Order.countDocuments(),                       // كل الطلبات
      Product.countDocuments(),                     // كل المنتجات
      Order.countDocuments({ status: "pending" }),  // قيد المعالجة
      Order.countDocuments({ status: "completed" }),// مكتملة
      Order.countDocuments({ status: "canceled" }), // ملغاة
    ]);

    // 🔹 أحدث 4 طلبات
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    // 🔹 مجموع المبيعات (كلها)
    const totalSalesAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const totalSales = totalSalesAgg.length > 0 ? totalSalesAgg[0].total : 0;

    // 🔹 مبيعات اليوم فقط (اختياري بس مفيد للـ widget)
    const todaySalesAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const todaySales = todaySalesAgg.length > 0 ? todaySalesAgg[0].total : 0;

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
      todaySales,       // ✅ جديد
      pendingOrders,    // ✅ جديد
      completedOrders,  // ✅ جديد
      canceledOrders,   // ✅ جديد
      latestOrders,
      categoryStats,
    });

  } catch (err: any) {
    console.error("❌ خطأ في API Dashboard:", err.message);

    const statusCode =
      err.name === "JsonWebTokenError" || err.name === "TokenExpiredError"
        ? 401
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "❌ حدث خطأ غير متوقع",
    });
  }
}
