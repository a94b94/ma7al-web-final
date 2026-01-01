// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

function safeStr(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

// ✅ Redis اختياري: إذا فشل لا يكسر الـ API
async function redisGetSafe(key: string) {
  try {
    if (!redis) return null;
    const cached = await redis.get(key);
    return cached || null;
  } catch (e: any) {
    console.warn("⚠️ Redis GET failed:", e?.message || e);
    return null;
  }
}

async function redisSetSafe(key: string, value: string, ttlSeconds: number) {
  try {
    if (!redis) return;
    await redis.set(key, value, "EX", ttlSeconds);
  } catch (e: any) {
    console.warn("⚠️ Redis SET failed:", e?.message || e);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  const id = safeStr(req.query.id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "❌ معرف المنتج غير صالح أو مفقود" });
  }

  const cacheKey = `product:v1:${id}`;

  try {
    // 🔄 1) Redis cache (اختياري)
    const cached = await redisGetSafe(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 🔄 2) DB
    await connectToDatabase();

    // ✅ فلتر منشور (توافق published/isPublished)
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ published: true }, { isPublished: true }],
    })
      // ✅ لو تريد تعرض بيانات المتجر بالواجهة (متاجر متعددة)
      .populate("storeId", "storeName storeLogo address")
      .lean();

    if (!product) {
      return res.status(404).json({ error: "❌ لم يتم العثور على المنتج" });
    }

    const productToReturn = {
      ...product,
      _id: (product as any)?._id?.toString?.() || String((product as any)._id),
      storeId: (product as any)?.storeId
        ? {
            ...(product as any).storeId,
            _id:
              (product as any).storeId?._id?.toString?.() ||
              String((product as any).storeId?._id),
          }
        : null,
    };

    // ⏱️ كاش 10 دقائق
    await redisSetSafe(cacheKey, JSON.stringify(productToReturn), 600);

    return res.status(200).json(productToReturn);
  } catch (error: any) {
    console.error("❌ /api/products/[id] error:", error);

    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({
        error: "🚨 فشل في جلب المنتج من الخادم",
        details: error?.message || String(error),
      });
    }

    return res.status(500).json({ error: "🚨 فشل في جلب المنتج من الخادم" });
  }
}
