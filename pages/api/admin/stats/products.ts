// pages/api/admin/stats/products.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { verifyToken, authorizeRoles } from "@/middleware/auth";

type StatsResponse =
  | {
      success: true;
      total: number;
      published: number;
      unpublished: number;
      message: string;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  try {
    // ✅ Auth (مرحلة ثانية)
    const user = verifyToken(req);
    authorizeRoles(user, ["owner", "manager"]); // عدّلها حسب نظامك

    await dbConnect();

    // ✅ store scope:
    // - الأفضل: user.storeId
    // - fallback: user.userId (لو أنت تعتبر صاحب المتجر = المستخدم)
    const storeKey = user.storeId || user.userId;

    // إذا كان storeId عندك ObjectId (وهو الغالب)
    const storeObjectId = mongoose.Types.ObjectId.isValid(storeKey)
      ? new mongoose.Types.ObjectId(storeKey)
      : null;

    // إذا ما نقدر نحوله ObjectId، نرجع خطأ واضح
    if (!storeObjectId) {
      return res.status(400).json({
        success: false,
        error: "⚠️ storeId غير صالح داخل التوكن",
        code: "STORE_ID_INVALID",
      });
    }

    // ✅ احصائيات مفيدة للإدارة
    // ملاحظة: موديل Product عندك فيه published
    // ومع توافق خلفي لو عندك isPublished
    const baseFilter: any = { storeId: storeObjectId };

    const [total, published, isPublishedTotal] = await Promise.all([
      Product.countDocuments(baseFilter),
      Product.countDocuments({ ...baseFilter, published: true }),
      // توافق خلفي فقط (إذا لديك isPublished)
      Product.countDocuments({ ...baseFilter, isPublished: true }).catch(() => 0),
    ]);

    // published النهائي: إذا عندك بيانات تستخدم published أو isPublished
    const finalPublished = Math.max(published, isPublishedTotal);
    const unpublished = Math.max(0, total - finalPublished);

    return res.status(200).json({
      success: true,
      total,
      published: finalPublished,
      unpublished,
      message: "✅ تم جلب إحصائيات المنتجات بنجاح",
    });
  } catch (error: any) {
    const msg = error?.message || "UNKNOWN_ERROR";

    // رسائل أنظف للعميل
    if (msg === "TOKEN_MISSING" || msg === "TOKEN_INVALID" || msg === "TOKEN_EXPIRED") {
      return res.status(401).json({
        success: false,
        error: "🚫 غير مصرح: توكن مفقود/غير صالح",
        code: msg,
      });
    }

    if (msg === "FORBIDDEN_ROLE") {
      return res.status(403).json({
        success: false,
        error: "🚫 لا تملك صلاحية الوصول",
        code: msg,
      });
    }

    console.error("⛔ Error counting products:", msg);
    return res.status(500).json({
      success: false,
      error: "⚠️ حدث خطأ أثناء جلب إحصائيات المنتجات",
      code: "SERVER_ERROR",
    });
  }
}
