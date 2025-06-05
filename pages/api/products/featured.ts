// pages/api/products/featured.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "❌ الطريقة غير مسموحة" });
  }

  const cacheKey = "featured-products";

  try {
    // ✅ تحقق من وجود كاش
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    await dbConnect();

    // ✅ جلب المنتجات المميزة والمنشورة فقط
    const featuredProducts = await Product.find({
      isFeatured: true,
      isPublished: true, // تأكد أن هذا الحقل موجود في الموديل
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ تخزين النتيجة في Redis لمدة دقيقة
    await redis.set(cacheKey, JSON.stringify(featuredProducts), "EX", 60);

    return res.status(200).json(featuredProducts);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات المميزة:", error.message || error);
    return res.status(500).json({ message: "⚠️ حدث خطأ أثناء الجلب" });
  }
}
