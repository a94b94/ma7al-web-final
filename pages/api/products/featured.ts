// pages/api/products/featured.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "❌ الطريقة غير مسموحة" });
  }

  try {
    const { category, page = "1", limit = "12" } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isFeatured: true, isPublished: true };
    if (category && typeof category === "string") {
      filter.category = category;
    }

    const cacheKey = `featured-products:${category || "all"}:p${pageNum}:l${limitNum}`;

    // ✅ تحقق من الكاش
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // ✅ الاتصال بقاعدة البيانات
    await connectToDatabase();

    const featuredProducts = await Product.find(filter)
      .populate("storeId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const cleaned = featuredProducts.map((product) => ({
      ...product,
      _id: product._id.toString(),
      storeId: {
        ...product.storeId,
        _id: product.storeId?._id?.toString?.() || undefined,
      },
    }));

    await redis.set(cacheKey, JSON.stringify(cleaned), "EX", 60);

    return res.status(200).json(cleaned);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات المميزة:", error?.message || error);
    return res.status(500).json({ message: "⚠️ فشل في جلب المنتجات" });
  }
}
