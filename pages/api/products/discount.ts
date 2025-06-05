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
    // ✅ جرب جلب البيانات من Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // ✅ الاتصال بقاعدة البيانات
    await connectToDatabase();

    // ✅ جلب المنتجات مع بيانات المتجر
    const discounted = await Product.find({
      discount: { $gt: 0 },
      isPublished: true
    })
      .populate("storeId", "name") // ✅ هنا الإضافة المهمة
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ تخزين النتيجة في Redis لمدة 60 ثانية
    await redis.set(cacheKey, JSON.stringify(discounted), "EX", 60);

    return res.status(200).json(discounted);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات المخفضة:", error?.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات المخفضة" });
  }
}
