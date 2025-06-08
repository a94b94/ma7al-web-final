// ✅ ملف: pages/api/categories/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Category from "@/models/Category";
import { verifyToken } from "@/middleware/auth"; // تأكد من وجود هذه الدالة

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const categories = await Category.find().sort({ name: 1 }).lean().exec();
      return res.status(200).json({
        success: true,
        message: "✅ تم جلب الأقسام بنجاح",
        categories,
      });
    } catch (error: any) {
      console.error("❌ خطأ أثناء جلب الأقسام:", error.message);
      return res.status(500).json({
        success: false,
        message: "❌ حدث خطأ أثناء جلب الأقسام",
        error: error.message,
      });
    }
  }

  if (req.method === "POST") {
    try {
      // ✅ تحقق من التوكن
      let user: any;
      try {
        user = verifyToken(req); // يجب أن يُرجع { userId, storeId, role }
      } catch {
        return res.status(401).json({
          success: false,
          message: "🚫 توكن غير صالح أو مفقود",
        });
      }

      // ✅ السماح فقط لـ owner و manager
      if (!["owner", "manager"].includes(user?.role)) {
        return res.status(403).json({
          success: false,
          message: "🚫 لا تملك صلاحية لإضافة قسم",
        });
      }

      const { name, icon } = req.body;

      if (!name || typeof name !== "string") {
        return res.status(400).json({
          success: false,
          message: "⚠️ اسم القسم مطلوب",
        });
      }

      const existing = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "❗ هذا القسم موجود مسبقًا",
        });
      }

      const newCategory = await Category.create({
        name: name.trim(),
        icon: icon?.trim() || "",
      });

      return res.status(201).json({
        success: true,
        message: "✅ تم إنشاء القسم بنجاح",
        category: newCategory,
      });
    } catch (error: any) {
      console.error("❌ خطأ أثناء إنشاء القسم:", error.message);
      return res.status(500).json({
        success: false,
        message: "❌ حدث خطأ أثناء إنشاء القسم",
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "❌ الطريقة غير مسموحة",
  });
}
