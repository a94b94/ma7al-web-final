// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مدعومة" });
  }

  const {
    category = "",
    search = "",
    page = "1",
    limit = "12",
  } = req.query;

  const pageNumber = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 12;

  const filter: any = { isPublished: true };

  if (category && typeof category === "string") {
    filter.category = category;
  }

  if (search && typeof search === "string") {
    filter.name = { $regex: search, $options: "i" }; // بحث جزئي غير حساس لحالة الأحرف
  }

  const cacheKey = `products:${category}:${search}:${page}:${limit}`;

  try {
    // ✅ جرب من الكاش أولاً
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    await connectToDatabase();

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("storeId", "storeName location")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const cleanProducts = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      storeId: p.storeId
        ? {
            ...p.storeId,
            _id: p.storeId._id?.toString?.() || undefined,
          }
        : null,
    }));

    const responseData = {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      products: cleanProducts,
    };

    // ✅ خزّن في Redis لمدة 2 دقيقة
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 120);

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error?.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات من السيرفر" });
  }
}
