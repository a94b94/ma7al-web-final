import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "الطريقة غير مسموحة" });
  }

  const id = req.query.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "معرف المنتج غير صالح" });
  }

  const cacheKey = `product:${id}`;

  try {
    // ✅ 1. جرب جلب المنتج من Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // ✅ 2. إذا غير موجود بالكاش، جلبه من MongoDB
    await connectToDatabase();
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ error: "لم يتم العثور على المنتج" });
    }

    // ✅ 3. خزن الناتج في Redis لمدة 10 دقائق
    await redis.set(cacheKey, JSON.stringify(product), "EX", 600);

    return res.status(200).json(product);
  } catch (error: any) {
    console.error("❌ خطأ في API:", error.message);
    return res.status(500).json({ error: "فشل في جلب المنتج" });
  }
}
