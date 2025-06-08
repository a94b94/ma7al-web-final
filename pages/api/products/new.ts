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
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    await dbConnect();

    const products = await Product.find({ isPublished: true })
      .populate("storeId", "name")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    const cleaned = products.map((p: any) => {
      const store = typeof p.storeId === "object" && "name" in p.storeId
        ? {
            _id: p.storeId._id?.toString?.() || undefined,
            name: p.storeId.name || "",
          }
        : null;

      return {
        ...p,
        _id: p._id.toString(),
        storeId: store,
      };
    });

    await redis.set(cacheKey, JSON.stringify(cleaned), "EX", 120);

    return res.status(200).json(cleaned);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات" });
  }
}
