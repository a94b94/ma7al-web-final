// pages/api/activity/log.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Activity from "@/models/Activity";
import { isValidObjectId } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "🚫 الطريقة غير مدعومة" });
  }

  try {
    const { userId, productId, category, action } = req.body;

    if (!productId || !category || !action) {
      return res.status(400).json({ success: false, message: "⚠️ جميع الحقول مطلوبة" });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "⚠️ معرف المنتج غير صالح" });
    }

    if (userId && !isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "⚠️ معرف المستخدم غير صالح" });
    }

    await connectDB();

    await Activity.create({
      userId: userId || "guest",
      productId,
      category,
      action,
    });

    return res.status(200).json({ success: true, message: "✅ تم تسجيل النشاط بنجاح" });
  } catch (error: any) {
    console.error("❌ خطأ في تسجيل النشاط:", error.message);
    return res.status(500).json({ success: false, message: "❌ حدث خطأ أثناء تسجيل النشاط" });
  }
}
