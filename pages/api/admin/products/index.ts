// pages/api/admin/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import { verifyToken } from "@/middleware/auth";
import redis from "@/lib/redis";

// ================= Helpers =================
function safeStr(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

function toInt(v: any, fallback: number) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function toNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(v: any, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    if (v.toLowerCase() === "true") return true;
    if (v.toLowerCase() === "false") return false;
  }
  return fallback;
}

function normalizeImages(images: any): string[] {
  if (!images) return [];

  if (Array.isArray(images) && images.every((x) => typeof x === "string")) {
    return images.map((x) => x.trim()).filter(Boolean);
  }

  if (
    Array.isArray(images) &&
    images.every((x) => x && typeof x === "object" && typeof x.url === "string")
  ) {
    return images.map((x) => String(x.url).trim()).filter(Boolean);
  }

  return [];
}

function assertRole(user: any, allowed: string[]) {
  const role = String(user?.role || "");
  if (!allowed.includes(role)) {
    const err: any = new Error("FORBIDDEN_ROLE");
    err.code = "FORBIDDEN_ROLE";
    throw err;
  }
}

async function redisDelByPrefixSafe(prefix: string) {
  try {
    if (!redis) return;
    const keys = await (redis as any).keys?.(`${prefix}*`);
    if (Array.isArray(keys) && keys.length) {
      await Promise.all(keys.map((k: string) => redis.del(k)));
    }
  } catch (e: any) {
    console.warn("⚠️ Redis DEL failed:", e?.message || e);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ Auth
    const user = verifyToken(req);

    // ✅ Roles
    assertRole(user, ["owner", "manager", "admin"]);

    await dbConnect();

    // ✅ store scope
    const storeKey = String(user?.storeId || user?.userId || "");
    if (!storeKey || !mongoose.Types.ObjectId.isValid(storeKey)) {
      return res.status(400).json({
        success: false,
        message: "⚠️ storeId غير صالح داخل التوكن",
      });
    }
    const storeId = new mongoose.Types.ObjectId(storeKey);

    // =========================
    // GET: list products (admin)
    // =========================
    if (req.method === "GET") {
      const page = toInt(req.query.page, 1);
      const limit = Math.min(toInt(req.query.limit, 12), 100);

      const search = safeStr(req.query.search);
      const category = safeStr(req.query.category);
      const publishedParam = safeStr(req.query.published); // "true" | "false" | ""

      const filter: any = { storeId };

      if (category && category.toLowerCase() !== "all") {
        filter.category = category;
      }

      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      // ✅ توافق خلفي: published أو isPublished
      if (publishedParam === "true") {
        filter.$or = [{ published: true }, { isPublished: true }];
      } else if (publishedParam === "false") {
        filter.$or = [{ published: false }, { isPublished: false }];
      }

      const total = await Product.countDocuments(filter);

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const cleanProducts = products.map((p: any) => ({
        ...p,
        _id: p?._id?.toString?.() || String(p._id),
        storeId: p?.storeId?.toString?.() || String(p.storeId),
      }));

      return res.status(200).json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        products: cleanProducts,
      });
    }

    // =========================
    // POST: create product (admin)
    // =========================
    if (req.method === "POST") {
      const name = safeStr(req.body?.name);
      const category = safeStr(req.body?.category);
      const price = toNumber(req.body?.price, NaN);

      const discount = Math.max(0, toNumber(req.body?.discount, 0));
      const stock = Math.max(0, toNumber(req.body?.stock, 0));
      const location = safeStr(req.body?.location);

      const isFeatured = toBool(req.body?.isFeatured, false);

      const published =
        typeof req.body?.published === "boolean" ? req.body.published : true;

      const barcode = safeStr(req.body?.barcode);
      const sku = safeStr(req.body?.sku) || barcode;

      const images = normalizeImages(req.body?.images);

      if (!name || !category || !Number.isFinite(price) || price < 0 || images.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "⚠️ الحقول الأساسية مطلوبة: name, category, price (رقم), images (على الأقل صورة)",
        });
      }

      const created = await Product.create({
        name,
        category,
        price,
        images,
        discount,
        stock,
        location,
        isFeatured,
        published,
        isPublished: published, // توافق خلفي
        sku: sku || undefined,
        storeId, // ✅ أهم شيء
      });

      // ✅ حل مشكلة unknown: خذ plain object أولاً
      const obj: any =
        typeof (created as any).toObject === "function"
          ? (created as any).toObject()
          : created;

      const idStr = obj?._id?.toString?.() || String(obj?._id || "");
      const storeIdStr = obj?.storeId?.toString?.() || String(obj?.storeId || storeId);

      // ✅ كسر كاش المنتجات (للزبائن) إذا عندك
      await redisDelByPrefixSafe("products:v3:");
      await redisDelByPrefixSafe("products:v2:");
      await redisDelByPrefixSafe("products:");

      return res.status(201).json({
        success: true,
        message: "✅ تم إنشاء المنتج بنجاح",
        product: {
          ...obj,
          _id: idStr,
          storeId: storeIdStr,
        },
      });
    }

    return res.status(405).json({ success: false, message: "❌ Method Not Allowed" });
  } catch (error: any) {
    const msg = error?.message || "UNKNOWN_ERROR";

    if (msg.includes("التوكن") || msg.includes("JWT") || msg.includes("TOKEN")) {
      return res.status(401).json({
        success: false,
        message: "🚫 غير مصرح: توكن مفقود/غير صالح",
      });
    }

    if (msg === "FORBIDDEN_ROLE") {
      return res.status(403).json({
        success: false,
        message: "🚫 لا تملك صلاحية الوصول",
      });
    }

    console.error("❌ /api/admin/products error:", msg);
    return res.status(500).json({
      success: false,
      message: "⚠️ خطأ في الخادم",
      error: process.env.NODE_ENV !== "production" ? msg : undefined,
    });
  }
}
