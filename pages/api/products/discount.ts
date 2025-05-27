// pages/api/products/discount.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "الطريقة غير مسموحة" });
  }

  const cacheKey = "discount-products";

  try {
    // ✅ تحقق من الكاش
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    await connectToDatabase();

    const discounted = await Product.find({ discount: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ خزن النتيجة في Redis لمدة 60 ثانية
    await redis.set(cacheKey, JSON.stringify(discounted), "EX", 60);

    return res.status(200).json(discounted);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات المخفضة:", typeof error.message === "string" ? error.message : error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات المخفضة" });
  }
}
