import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    // ✅ تحقق من التوكن
    verifyToken(req);

    if (req.method === "PATCH") {
      const { userId, newRole } = req.body;

      if (!userId || !newRole) {
        return res.status(400).json({ error: "❌ يجب توفير userId و newRole" });
      }

      const allowedRoles = ["owner", "manager", "support"];
      if (!allowedRoles.includes(newRole)) {
        return res.status(400).json({ error: "❌ نوع صلاحية غير صالح" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "❌ المستخدم غير موجود" });
      }

      return res.status(200).json({
        message: "✅ تم تحديث الصلاحية بنجاح",
        user: updatedUser,
      });
    }

    return res.status(405).json({ error: "❌ Method Not Allowed" });
  } catch (error: any) {
    console.error("⛔ خطأ في تعديل صلاحية المستخدم:", error.message);
    return res.status(500).json({ error: "⚠️ فشل في تعديل الصلاحية" });
  }
}
