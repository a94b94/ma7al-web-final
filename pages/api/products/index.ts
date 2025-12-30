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
    // Redis اختياري: لا تكسر الطلب
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
  const storeId = safeStr(req.query.storeId); // ✅ جديد (اختياري)
  const pageNumber = toInt(req.query.page, 1);
  const pageSize = Math.min(toInt(req.query.limit, 12), 100);

  // ✅ فلتر أساسي
  const filter: any = { isPublished: true };

  // ✅ category: لا تضيفها إذا فاضية أو all
  if (category && category.toLowerCase() !== "all") {
    filter.category = category;
  }

  // ✅ search
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // ✅ storeId (متاجر متعددة)
  // إذا Product.storeId ObjectId (وهو الغالب)، حوّله ObjectId
  if (storeId) {
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ error: "⚠️ storeId غير صالح" });
    }
    filter.storeId = new mongoose.Types.ObjectId(storeId);
  }

  const cacheKey = `products:v2:${storeId || "all"}:${category || "all"}:${search || "none"}:${pageNumber}:${pageSize}`;

  try {
    // ✅ Redis cache (اختياري)
    const cached = await redisGetSafe(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached) as ProductsResponse);
    }

    await connectToDatabase();

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      // ✅ مهم: storeId عندك مرتبط بـ User حسب آخر التعديلات
      // عدّل الحقول حسب الموجود فعليًا في User model
      .populate("storeId", "storeName address location storeLogo")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    // ✅ تنظيف ObjectId إلى string لمنع مشاكل serialization بالفرونت
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

    // ✅ خزّن 2 دقيقة (اختياري)
    await redisSetSafe(cacheKey, JSON.stringify(responseData), 120);

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error("❌ /api/products error:", error);

    // ✅ في التطوير رجّع تفاصيل تساعدك بالتشخيص
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({
        error: "⚠️ فشل في جلب المنتجات من السيرفر",
        details: error?.message || String(error),
      });
    }

    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات من السيرفر" });
  }
}
