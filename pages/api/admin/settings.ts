// pages/api/admin/settings.ts

import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "❌ الطريقة غير مسموحة" });
  }

  try {
    const { userId, storeName, storeLogo, whatsappNumber } = req.body;

    // ✅ تحقق من الحقول المطلوبة
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ success: false, message: "⚠️ معرف المستخدم مطلوب" });
    }
    if (!storeName || typeof storeName !== "string") {
      return res.status(400).json({ success: false, message: "⚠️ اسم المتجر مطلوب" });
    }

    // ✅ تحقق من التوكن
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "🚫 غير مصرح. لم يتم إرسال التوكن" });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ success: false, message: "❌ توكن غير صالح أو منتهي" });
    }

    // ✅ تحقق أن المستخدم الذي يعدل هو نفس المستخدم المصرّح له
    if (decoded.userId !== userId) {
      return res.status(403).json({ success: false, message: "❌ لا تملك صلاحية تعديل هذه الإعدادات" });
    }

    await connectToDatabase();

    const updateFields: any = {
      storeName: storeName.trim(),
    };

    if (storeLogo && typeof storeLogo === "string") {
      updateFields.storeLogo = storeLogo.trim();
    }

    if (whatsappNumber && typeof whatsappNumber === "string") {
      updateFields.whatsappNumber = whatsappNumber.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "❌ لم يتم العثور على المستخدم" });
    }

    return res.status(200).json({
      success: true,
      message: "✅ تم تحديث إعدادات المتجر بنجاح",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("❌ خطأ أثناء تحديث الإعدادات:", error);
    return res.status(500).json({
      success: false,
      message: "❌ حدث خطأ أثناء التحديث",
      error: error.message,
    });
  }
}
