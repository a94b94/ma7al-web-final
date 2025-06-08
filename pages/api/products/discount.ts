// pages/api/products/discount.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  const cacheKey = "discount-products";

  try {
    // ✅ جلب من Redis إن أمكن
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    await connectToDatabase();

    const discounted = await Product.find({
      discount: { $gt: 0 },
      isPublished: true,
    })
      .populate("storeId", "name") // جلب اسم المتجر
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ تحويل _id لسلسلة
    const cleaned = discounted.map((product) => ({
      ...product,
      _id: product._id.toString(),
      storeId: {
        ...product.storeId,
        _id: product.storeId?._id?.toString?.() || undefined,
      },
    }));

    // ✅ تخزين في Redis لمدة 60 ثانية
    await redis.set(cacheKey, JSON.stringify(cleaned), "EX", 60);

    return res.status(200).json(cleaned);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات المخفضة:", error?.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات المخفضة" });
  }
}
