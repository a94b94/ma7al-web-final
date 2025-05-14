// pages/api/products/discount.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis"; // تأكد من وجود هذا الملف

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cacheKey = "discount-products";

  try {
    // ✅ تحقق من الكاش أولاً
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    await connectToDatabase();

    const discounted = await Product.find({ discount: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ خزّن النتيجة مؤقتًا في Redis لمدة 60 ثانية
    await redis.set(cacheKey, JSON.stringify(discounted), "EX", 60);

    res.status(200).json(discounted);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات المخفضة:", error.message || error);
    res.status(500).json({ error: "فشل في جلب المنتجات المخفضة" });
  }
}
