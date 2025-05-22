// ✅ ملف: pages/api/analytics/installments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    // الأقساط المدفوعة يومياً (آخر 30 يوم)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const daily = await Order.aggregate([
      { $unwind: "$installments" },
      { $match: { "installments.paid": true, "installments.paidAt": { $gte: thirtyDaysAgo } } },
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

    // أكثر الزبائن التزامًا
    const topCustomers = await Order.aggregate([
      { $unwind: "$installments" },
      { $match: { "installments.paid": true } },
      {
        $group: {
          _id: "$customerName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // الزبائن المتأخرين
    const lateCustomers = await Order.aggregate([
      { $unwind: "$installments" },
      { $match: { "installments.paid": false, "installments.date": { $lt: today } } },
      {
        $group: {
          _id: "$customerName",
          lateCount: { $sum: 1 },
        },
      },
      { $sort: { lateCount: -1 } },
    ]);

    res.status(200).json({ daily, topCustomers, lateCustomers });
  } catch (err) {
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
