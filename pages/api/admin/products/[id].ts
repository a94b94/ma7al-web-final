// pages/api/admin/products/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken } from "@/middleware/auth";
import redis from "@/lib/redis";

// ✅ Redis اختياري: لا نكسر الـ API لو مو متصل
async function redisDelByPrefixSafe(prefix: string) {
  try {
    if (!redis) return;

    // Upstash قد لا يدعم KEYS حسب الخطة/الإعدادات
    const keys = await (redis as any).keys?.(`${prefix}*`);
    if (Array.isArray(keys) && keys.length) {
      await Promise.all(keys.map((k: string) => redis.del(k)));
    }
  } catch (e: any) {
    console.warn("⚠️ Redis DEL by prefix failed:", e?.message || e);
  }
}

async function redisDelSafe(key: string) {
  try {
    if (!redis) return;
    await redis.del(key);
  } catch (e: any) {
    console.warn("⚠️ Redis DEL failed:", e?.message || e);
  }
}

function safeStr(v: any) {
  return typeof v === "string" ? v.trim() : "";
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

/**
 * ✅ يدعم:
 * - string[]
 * - أو [{url, public_id}] -> يرجّع urls فقط
 */
function normalizeImages(images: any): string[] | undefined {
  if (images === undefined) return undefined;

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = safeStr(req.query.id);

  // ✅ تحقق id
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "❌ معرف المنتج غير صالح" });
  }

  // ✅ تحقق JWT
  let user: any;
  try {
    user = verifyToken(req);
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "🚫 توكن غير صالح أو مفقود" });
  }

  // ✅ صلاحيات
  const allowedRoles = new Set(["admin", "owner", "manager"]);
  if (!allowedRoles.has(String(user?.role || ""))) {
    return res
      .status(403)
      .json({ success: false, message: "🚫 لا تملك صلاحية" });
  }

  // ✅ store scope
  const storeIdStr = safeStr(user?.storeId);
  if (!storeIdStr || !mongoose.Types.ObjectId.isValid(storeIdStr)) {
    return res
      .status(403)
      .json({ success: false, message: "🚫 storeId غير موجود في التوكن" });
  }

  try {
    await connectToDatabase();
    const storeObjectId = new mongoose.Types.ObjectId(storeIdStr);

    // =========================================================
    // GET: جلب منتج واحد للإدارة (حتى لو غير منشور)
    // =========================================================
    if (req.method === "GET") {
      const product = await Product.findOne({
        _id: new mongoose.Types.ObjectId(id),
        storeId: storeObjectId,
      }).lean();

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "❌ المنتج غير موجود" });
      }

      return res.status(200).json({
        success: true,
        product: {
          ...product,
          _id:
            (product as any)?._id?.toString?.() || String((product as any)._id),
          storeId:
            (product as any)?.storeId?.toString?.() ||
            String((product as any).storeId),
        },
      });
    }

    // =========================================================
    // PUT: تحديث منتج
    // =========================================================
    if (req.method === "PUT") {
      const body = req.body || {};

      const name = safeStr(body.name);
      const category = safeStr(body.category);
      const sku = safeStr(body.sku);
      const location = safeStr(body.location);

      const price = body.price !== undefined ? toNumber(body.price) : undefined;
      const discount =
        body.discount !== undefined ? toNumber(body.discount, 0) : undefined;
      const stock =
        body.stock !== undefined ? toNumber(body.stock, 0) : undefined;

      const published =
        body.published !== undefined ? toBool(body.published) : undefined;
      const isFeatured =
        body.isFeatured !== undefined ? toBool(body.isFeatured) : undefined;

      const images = normalizeImages(body.images);

      const update: any = {};

      if (name) update.name = name;
      if (category) update.category = category;
      if (sku) update.sku = sku;

      // ✅ تحديث location فقط إذا أرسله الفرونت
      if (body.location !== undefined) update.location = location;

      if (price !== undefined) {
        if (price < 0)
          return res
            .status(400)
            .json({ success: false, message: "⚠️ السعر غير صالح" });
        update.price = price;
      }

      if (discount !== undefined) {
        if (discount < 0)
          return res
            .status(400)
            .json({ success: false, message: "⚠️ الخصم غير صالح" });
        update.discount = discount;
      }

      if (stock !== undefined) {
        if (stock < 0)
          return res
            .status(400)
            .json({ success: false, message: "⚠️ المخزون غير صالح" });
        update.stock = stock;
      }

      if (published !== undefined) {
        update.published = published;
        // ✅ توافق خلفي لبيانات قديمة
        update.isPublished = published;
      }

      if (isFeatured !== undefined) update.isFeatured = isFeatured;

      if (images !== undefined) {
        if (images.length === 0) {
          return res.status(400).json({
            success: false,
            message: "⚠️ يجب إضافة صورة واحدة على الأقل",
          });
        }
        update.images = images;
      }

      if (Object.keys(update).length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "⚠️ لا يوجد حقول للتحديث" });
      }

      const updated = await Product.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), storeId: storeObjectId },
        { $set: update },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "❌ المنتج غير موجود أو لا تملك صلاحية",
        });
      }

      // ✅ امسح كاش قائمة المنتجات + المنتج المفرد
      await redisDelByPrefixSafe("products:v3:");
      await redisDelSafe(`product:v1:${id}`);

      return res.status(200).json({
        success: true,
        message: "✅ تم تحديث المنتج بنجاح",
        product: {
          ...updated,
          _id:
            (updated as any)?._id?.toString?.() || String((updated as any)._id),
          storeId:
            (updated as any)?.storeId?.toString?.() ||
            String((updated as any).storeId),
        },
      });
    }

    // =========================================================
    // DELETE: حذف منتج
    // =========================================================
    if (req.method === "DELETE") {
      const deleted = await Product.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        storeId: storeObjectId,
      }).lean();

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "❌ المنتج غير موجود أو لا تملك صلاحية",
        });
      }

      await redisDelByPrefixSafe("products:v3:");
      await redisDelSafe(`product:v1:${id}`);

      return res.status(200).json({
        success: true,
        message: "🗑️ تم حذف المنتج بنجاح",
        deletedId: id,
      });
    }

    return res
      .status(405)
      .json({ success: false, message: "❌ الطريقة غير مدعومة" });
  } catch (error: any) {
    console.error("❌ /api/admin/products/[id] error:", error);

    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({
        success: false,
        message: "⚠️ خطأ في الخادم",
        details: error?.message || String(error),
      });
    }

    return res.status(500).json({ success: false, message: "⚠️ خطأ في الخادم" });
  }
}
