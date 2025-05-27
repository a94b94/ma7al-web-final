import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "❌ الطريقة غير مسموحة" });
  }

  try {
    await dbConnect();

    // ✅ تحقق من التوكن وأخرج المستخدم
    const user = verifyToken(req);
    if (!user || !user._id) {
      return res.status(401).json({ message: "❌ غير مصرح" });
    }

    const { name, price, category, image, featured, discount } = req.body;

    // ✅ تحقق من الحقول المطلوبة
    if (!name || !price || !category || !image) {
      return res.status(400).json({ message: "❌ جميع الحقول مطلوبة" });
    }

    // ✅ إنشاء المنتج
    const product = await Product.create({
      name,
      price,
      category,
      image,
      isFeatured: featured ?? false,
      discount: discount ?? 0,
      storeId: user._id,
    });

    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    console.error("❌ فشل في إنشاء المنتج:", err.message);
    return res.status(500).json({ message: "⚠️ خطأ في السيرفر" });
  }
}
