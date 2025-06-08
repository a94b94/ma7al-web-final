// pages/api/admin/update-role.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";

const allowedRoles = ["owner", "manager", "support"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ success: false, message: "❌ الطريقة غير مسموحة" });
  }

  try {
    await dbConnect();

    // ✅ تحقق من التوكن واستخراج بيانات المستخدم
    let adminUser;
    try {
      adminUser = verifyToken(req); // يجب أن ترجع بيانات المستخدم: { userId, email, role }
    } catch {
      return res.status(401).json({ success: false, message: "🚫 توكن غير صالح أو مفقود" });
    }

    if (!adminUser || adminUser.role !== "owner") {
      return res.status(403).json({ success: false, message: "🚫 غير مصرح لك بتعديل صلاحيات المستخدمين" });
    }

    const { userId, newRole } = req.body;

    if (!userId || !newRole || typeof userId !== "string" || typeof newRole !== "string") {
      return res.status(400).json({ success: false, message: "⚠️ userId و newRole مطلوبان" });
    }

    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: "❌ نوع الصلاحية غير مسموح" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole.trim() },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "❌ المستخدم غير موجود" });
    }

    return res.status(200).json({
      success: true,
      message: "✅ تم تحديث صلاحية المستخدم بنجاح",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("⛔ خطأ في تعديل صلاحية المستخدم:", error.message);
    return res.status(500).json({
      success: false,
      message: "⚠️ حدث خطأ أثناء تعديل الصلاحية",
      error: error.message,
    });
  }
}
