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

    // ✅ تحقق من التوكن
    const user = verifyToken(req);
    if (!user || !user._id) {
      return res.status(401).json({ message: "❌ غير مصرح لك" });
    }

    const {
      name,
      price,
      category,
      images,
      isFeatured = false,
      discount = 0,
      stock = 0,
      location = "",
    } = req.body;

    // ✅ تحقق من الحقول المطلوبة
    if (!name || !price || !category || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "❌ تأكد من إدخال الاسم، السعر، القسم، والصورة" });
    }

    // ✅ إنشاء المنتج الجديد
    const newProduct = await Product.create({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      images: images.map((img: string) => img.trim()),
      isFeatured,
      discount: Number(discount),
      stock: Number(stock),
      location: location?.trim() || "",
      storeId: user._id, // ربط المنتج بصاحب الحساب
    });

    return res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error("❌ فشل في إنشاء المنتج:", err.message);
    return res.status(500).json({ message: "⚠️ خطأ في السيرفر، حاول لاحقًا" });
  }
}
