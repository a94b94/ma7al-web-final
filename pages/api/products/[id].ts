// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "❌ معرف المنتج غير صالح أو مفقود" });
  }

  const cacheKey = `product:${id}`;

  try {
    // 🔄 1. المحاولة من Redis أولاً
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 🔄 2. من قاعدة البيانات
    await connectToDatabase();
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ error: "❌ لم يتم العثور على المنتج" });
    }

    const productToCache = {
      ...product,
      _id: product._id.toString(),
    };

    // ⏱️ حفظ في Redis لمدة 10 دقائق
    await redis.set(cacheKey, JSON.stringify(productToCache), "EX", 600);

    return res.status(200).json(productToCache);
  } catch (error: any) {
    console.error("❌ خطأ في API:", error);
    return res.status(500).json({ error: "🚨 فشل في جلب المنتج من الخادم" });
  }
}
