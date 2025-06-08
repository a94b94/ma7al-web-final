// ✅ ملف: pages/api/orders/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "🚫 Method Not Allowed" });
  }

  try {
    await dbConnect();

    // ✅ استخراج بيانات المستخدم من التوكن
    let user: any;
    try {
      user = verifyToken(req); // يجب أن يحتوي على storeId
    } catch {
      return res.status(401).json({ success: false, message: "❌ توكن غير صالح أو مفقود" });
    }

    if (!user?.storeId || !user?.storeName) {
      return res.status(400).json({ success: false, message: "⚠️ بيانات المتجر غير متوفرة" });
    }

    const {
      cart,
      total,
      customerName,
      customerPhone,
      phone,
      address,
      type = "cash",
      downPayment = 0,
      installmentsCount = 0,
      remaining = 0,
      dueDate,
      email,
    } = req.body;

    if (!cart || !total || !phone || !address) {
      return res.status(400).json({ success: false, message: "❗ البيانات الأساسية ناقصة" });
    }

    const newOrder = await Order.create({
      cart,
      total,
      phone,
      address,
      customerName,
      customerPhone,
      type,
      downPayment,
      installmentsCount,
      remaining,
      dueDate,
      email,
      sentBy: user.name || "مشرف",
      storeId: user.storeId, // ✅ ربط الطلب بالمتجر
      storeName: user.storeName,
    });

    return res.status(201).json({
      success: true,
      message: "✅ تم إنشاء الطلب بنجاح",
      order: newOrder,
    });
  } catch (err: any) {
    console.error("❌ خطأ أثناء إنشاء الطلب:", err.message);
    return res.status(500).json({
      success: false,
      message: "⚠️ حدث خطأ أثناء إنشاء الطلب",
      error: err.message,
    });
  }
}
