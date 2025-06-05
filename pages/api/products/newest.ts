// pages/api/products/all.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مدعومة" });
  }

  const cacheKey = "all-products-latest";

  try {
    // ✅ جرب الكاش أولًا
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    await connectToDatabase();

    const products = await Product.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ خزّن النتيجة في Redis لمدة 60 ثانية
    await redis.set(cacheKey, JSON.stringify(products), "EX", 60);

    return res.status(200).json(products);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات" });
  }
}
