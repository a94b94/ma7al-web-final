import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  const id = req.query.id as string;

  // ✅ تحقق من صلاحية معرف المنتج
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "❌ معرف المنتج غير صالح" });
  }

  const cacheKey = `product:${id}`;

  try {
    // ✅ 1. جلب المنتج من Redis إن وُجد
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // ✅ 2. جلب من MongoDB إن لم يكن موجودًا في الكاش
    await connectToDatabase();
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ error: "❌ لم يتم العثور على المنتج" });
    }

    // ✅ 3. تنظيف _id وتخزين المنتج في Redis
    const productToCache = {
      ...product,
      _id: product._id.toString(),
    };

    await redis.set(cacheKey, JSON.stringify(productToCache), "EX", 600); // تخزين لمدة 10 دقائق

    return res.status(200).json(productToCache);
  } catch (error: any) {
    console.error("❌ خطأ في API:", error.message);
    return res.status(500).json({ error: "🚨 فشل في جلب المنتج من الخادم" });
  }
}
