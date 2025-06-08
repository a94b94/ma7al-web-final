// ✅ ملف: pages/api/analytics/installments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "❌ Method Not Allowed" });
  }

  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // 📊 الأقساط المدفوعة يومياً خلال آخر 30 يوم
    const daily = await Order.aggregate([
      { $unwind: "$installments" },
      {
        $match: {
          "installments.paid": true,
          "installments.paidAt": { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$installments.paidAt" },
          },
          totalPaid: { $sum: "$installments.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 🏆 أكثر الزبائن التزاماً بالدفع
    const topCustomers = await Order.aggregate([
      { $unwind: "$installments" },
      {
        $match: {
          "installments.paid": true,
          customerName: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$customerName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // 🔴 الزبائن المتأخرين (استحقاق مرّ عليه الوقت ولم يُدفع)
    const lateCustomers = await Order.aggregate([
      { $unwind: "$installments" },
      {
        $match: {
          "installments.paid": false,
          "installments.date": { $lt: today },
          customerName: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$customerName",
          lateCount: { $sum: 1 },
        },
      },
      { $sort: { lateCount: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: "✅ تم جلب تقارير الأقساط",
      data: {
        daily,
        topCustomers,
        lateCustomers,
      },
    });
  } catch (err: any) {
    console.error("❌ Error fetching analytics:", err.message);
    return res.status(500).json({
      success: false,
      message: "⚠️ فشل في جلب البيانات",
      error: err.message,
    });
  }
}
