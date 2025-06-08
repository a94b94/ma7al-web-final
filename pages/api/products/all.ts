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
    // ✅ تحقق من Redis أولًا
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    await connectToDatabase();

    // ✅ جلب المنتجات مع اسم المتجر فقط
    const products = await Product.find({ isPublished: true })
      .populate("storeId", "name") // فقط الاسم
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ✅ تنظيف وتنسيق البيانات
    const cleaned = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      storeId:
        p.storeId && typeof p.storeId === "object" && "name" in p.storeId
          ? {
              _id: (p.storeId as any)._id?.toString?.() || undefined,
              name: (p.storeId as any).name || "",
            }
          : null,
    }));

    // ✅ تخزين النتيجة في Redis لمدة 120 ثانية
    await redis.set(cacheKey, JSON.stringify(cleaned), "EX", 120);

    return res.status(200).json(cleaned);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات" });
  }
}
