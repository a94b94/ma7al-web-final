// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";
import mongoose from "mongoose";

type ProductsResponse = {
  total: number;
  page: number;
  pages: number;
  products: any[];
};

function toInt(v: any, fallback: number) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function safeStr(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

async function redisGetSafe(key: string) {
  try {
    if (!redis) return null;
    const cached = await redis.get(key);
    return cached || null;
  } catch (e) {
    console.warn("⚠️ Redis GET failed:", (e as any)?.message || e);
    return null;
  }
}

async function redisSetSafe(key: string, value: string, ttlSeconds: number) {
  try {
    if (!redis) return;
    await redis.set(key, value, "EX", ttlSeconds);
  } catch (e) {
    console.warn("⚠️ Redis SET failed:", (e as any)?.message || e);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مدعومة" });
  }

  const category = safeStr(req.query.category);
  const search = safeStr(req.query.search);
  const storeId = safeStr(req.query.storeId);
  const pageNumber = toInt(req.query.page, 1);
  const pageSize = Math.min(toInt(req.query.limit, 12), 100);

  // ✅ منشور (مع توافق خلفي إذا كان عندك isPublished)
  const filter: any = {
    $or: [{ published: true }, { isPublished: true }],
  };

  if (category && category.toLowerCase() !== "all") {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (storeId) {
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ error: "⚠️ storeId غير صالح" });
    }
    filter.storeId = new mongoose.Types.ObjectId(storeId);
  }

  const cacheKey = `products:v3:${storeId || "all"}:${category || "all"}:${search || "none"}:${pageNumber}:${pageSize}`;

  try {
    const cached = await redisGetSafe(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached) as ProductsResponse);
    }

    await connectToDatabase();

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      // ✅ storeId مرتبط بـ User
      // عدّل الحقول حسب User عندك (الأكثر شيوعًا: storeName, storeLogo, address)
      .populate("storeId", "storeName storeLogo address")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const cleanProducts = products.map((p: any) => ({
      ...p,
      _id: p?._id?.toString?.() || String(p._id),
      storeId: p.storeId
        ? {
            ...p.storeId,
            _id: p.storeId?._id?.toString?.() || String(p.storeId?._id),
          }
        : null,
    }));

    const responseData: ProductsResponse = {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      products: cleanProducts,
    };

    await redisSetSafe(cacheKey, JSON.stringify(responseData), 120);

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error("❌ /api/products error:", error);

    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({
        error: "⚠️ فشل في جلب المنتجات من السيرفر",
        details: error?.message || String(error),
      });
    }

    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات من السيرفر" });
  }
}
