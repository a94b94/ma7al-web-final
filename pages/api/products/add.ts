import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import { verifyToken } from "@/middleware/auth"; // لو عندك توكن

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    await dbConnect();

    // لو تستخرج user من التوكن:
    const user: any = verifyToken(req); // لازم ترجع _id من التوكن

    const { name, price, category, image, featured, discount } = req.body;

    if (!name || !price || !category || !image) {
      return res.status(400).json({ message: "❌ جميع الحقول مطلوبة" });
    }

    const product = await Product.create({
      name,
      price,
      category,
      image,
      isFeatured: featured || false,
      discount: discount || 0,
      storeId: user._id, // ✅ من التوكن
    });

    return res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("❌ فشل في إنشاء المنتج:", err);
    return res.status(500).json({ message: "⚠️ خطأ في السيرفر" });
  }
}
