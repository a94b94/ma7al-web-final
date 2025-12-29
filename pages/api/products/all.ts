// pages/api/products/all.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import redis from "@/lib/redis";

/**
 * إعدادات الكاش
 */
const DEFAULT_LIMIT = 12;
const REDIS_TTL_SECONDS = 120;

// Vercel/CDN cache (مفيد حتى مع Redis)
// s-maxage: مدة تخزين على CDN
// stale-while-revalidate: يخلي الـ CDN يرجع نسخة قديمة مؤقتاً وهو يحدث بالخلفية
const CDN_S_MAXAGE = 60;
const CDN_SWR = 300;

function toInt(value: any, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(100, Math.floor(n))); // limit 1..100
}

function makeEtag(payload: any) {
  const json = typeof payload === "string" ? payload : JSON.stringify(payload);
  return crypto.createHash("sha1").update(json).digest("hex");
}

async function redisGetSafe(key: string): Promise<string | null> {
  try {
    // بعض عملاء redis يرجعون string أو null
    const v = await redis.get(key);
    if (!v) return null;
    return typeof v === "string" ? v : JSON.stringify(v);
  } catch (e) {
    // Redis down => لا تفشل الطلب
    return null;
  }
}

async function redisSetSafe(key: string, value: string, ttlSeconds: number) {
  try {
    // Upstash style: redis.set(key, value, "EX", ttl)
    await redis.set(key, value, "EX", ttlSeconds);
  } catch (e) {
    // تجاهل فشل Redis
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "❌ الطريقة غير مدعومة" });
  }

  // ✅ params (اختياري)
  const limit = toInt(req.query.limit, DEFAULT_LIMIT);

  // ✅ key يعتمد على limit حتى ما يصير تضارب
  const cacheKey = `products:all:latest:limit=${limit}`;

  try {
    // ✅ 1) جرّب Redis أولاً
    const cached = await redisGetSafe(cacheKey);
    if (cached) {
      // CDN headers
      res.setHeader(
        "Cache-Control",
        `public, s-maxage=${CDN_S_MAXAGE}, stale-while-revalidate=${CDN_SWR}`
      );

      // ETag
      const etag = makeEtag(cached);
      res.setHeader("ETag", etag);

      // If-None-Match
      if (req.headers["if-none-match"] === etag) {
        return res.status(304).end();
      }

      return res.status(200).json(JSON.parse(cached));
    }

    // ✅ 2) DB
    await connectToDatabase();

    /**
     * ملاحظة مهمة:
     * تأكد من اسم حقل النشر في Product:
     * - عندك: isPublished
     * إذا مودلك مختلف (published مثلاً) غيره هنا فقط.
     */
    const products = await Product.find({ isPublished: true })
      .select(
        // قلّل الحقول لزيادة السرعة (عدّل حسب حاجتك)
        "_id name price images image category discount createdAt storeId"
      )
      .populate("storeId", "name") // فقط الاسم
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // ✅ 3) تنظيف IDs
    const cleaned = products.map((p: any) => ({
      ...p,
      _id: String(p._id),
      storeId:
        p.storeId && typeof p.storeId === "object"
          ? {
              _id: p.storeId._id ? String(p.storeId._id) : undefined,
              name: p.storeId.name || "",
            }
          : null,
    }));

    const json = JSON.stringify(cleaned);

    // ✅ 4) خزّن بالـ Redis
    await redisSetSafe(cacheKey, json, REDIS_TTL_SECONDS);

    // ✅ 5) CDN headers + ETag
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${CDN_S_MAXAGE}, stale-while-revalidate=${CDN_SWR}`
    );

    const etag = makeEtag(json);
    res.setHeader("ETag", etag);

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    return res.status(200).json(cleaned);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error?.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات" });
  }
}
