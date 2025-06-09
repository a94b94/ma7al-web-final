// pages/api/products/new.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مدعومة" });
  }

  const cacheKey = "products-new";

  try {
    // ✅ محاولة جلب البيانات من الكاش
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("📦 تم جلب المنتجات الجديدة من Redis Cache");
      return res.status(200).json(JSON.parse(cached));
    }

    // ✅ الاتصال بقاعدة البيانات
    await dbConnect();

    // ✅ جلب أحدث المنتجات المنشورة
    const products = await Product.find({ isPublished: true })
      .populate("storeId", "name")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ تنظيف وتنسيق البيانات
    const cleaned = products.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      storeId:
        p.storeId && typeof p.storeId === "object"
          ? {
              _id: p.storeId._id?.toString?.() || undefined,
              name: p.storeId.name || "",
            }
          : null,
    }));

    // ✅ تخزين البيانات في Redis لمدة 2 دقيقة
    await redis.set(cacheKey, JSON.stringify(cleaned), "EX", 120);
    console.log("✅ تم تخزين المنتجات الجديدة في Redis Cache");

    return res.status(200).json(cleaned);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات" });
  }
}
