// pages/api/products/new.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  const cacheKey = "new-products";

  try {
    // ✅ 1. التحقق من الكاش أولًا
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    await connectToDatabase();

    // ✅ 2. جلب المنتجات المنشورة فقط + بيانات المحل
    const newProducts = await Product.find({ isPublished: true })
      .populate("storeId", "name") // ✅ هذا السطر
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ 3. تخزين النتيجة في Redis لمدة 60 ثانية
    await redis.set(cacheKey, JSON.stringify(newProducts), "EX", 60);

    return res.status(200).json(newProducts);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات الجديدة:", error.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات الجديدة" });
  }
}
