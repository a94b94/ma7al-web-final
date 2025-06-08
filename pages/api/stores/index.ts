// pages/api/stores/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product"; // تأكد من وجود هذا الموديل

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    await connectToDatabase();

    // ✅ جلب جميع المتاجر التي تحتوي على اسم
    const rawStores = await User.find(
      { storeName: { $ne: null } },
      "storeName storeLogo city _id createdAt views"
    )
      .sort({ storeName: 1 })
      .lean();

    // ✅ حساب عدد المنتجات لكل متجر
    const storeIds = rawStores.map((s) => s._id);
    const productCounts = await Product.aggregate([
      { $match: { storeId: { $in: storeIds } } },
      { $group: { _id: "$storeId", count: { $sum: 1 } } },
    ]);

    const countMap = Object.fromEntries(
      productCounts.map((item) => [item._id.toString(), item.count])
    );

    const stores = rawStores.map((store) => ({
      ...store,
      productCount: countMap[store._id.toString()] || 0,
    }));

    return res.status(200).json(stores);
  } catch (error: any) {
    console.error("❌ فشل في جلب المتاجر:", error?.message || error);
    return res.status(500).json({ error: "⚠️ فشل داخلي في الخادم" });
  }
}
