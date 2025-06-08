// ✅ ملف: pages/api/admin/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "❌ الطريقة غير مسموحة" });
  }

  try {
    await connectDB();

    // ✅ تحقق من التوكن
    let user: any;
    try {
      user = verifyToken(req);
    } catch {
      return res.status(401).json({ success: false, message: "🚫 توكن غير صالح أو مفقود" });
    }

    if (!user?.storeId) {
      return res.status(400).json({ success: false, message: "⚠️ لا يمكن تحديد المتجر" });
    }

    // ✅ استخراج الفلاتر من query
    const { status, from, to, keyword } = req.query;

    const filter: any = {
      storeId: user.storeId,
    };

    // 🔹 فلترة حسب الحالة
    if (status && typeof status === "string") {
      filter.status = status;
    }

    // 🔹 فلترة حسب التاريخ
    if (from || to) {
      filter.createdAt = {};
      if (from && typeof from === "string") {
        filter.createdAt.$gte = new Date(from);
      }
      if (to && typeof to === "string") {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    // 🔍 فلترة بالكلمة المفتاحية
    if (keyword && typeof keyword === "string") {
      const regex = new RegExp(keyword, "i");
      filter.$or = [
        { customerName: regex },
        { phone: regex },
        { customerPhone: regex },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      message: "✅ تم جلب الطلبات بنجاح",
      orders,
    });
  } catch (err: any) {
    console.error("❌ خطأ في جلب الطلبات:", err.message);
    return res.status(500).json({
      success: false,
      message: "⚠️ خطأ في الخادم",
      error: err.message,
    });
  }
}
