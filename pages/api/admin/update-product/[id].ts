// pages/api/products/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, message: "❌ الطريقة غير مدعومة" });
  }

  // ✅ تحقق من التوكن
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "🚫 غير مصرح. يجب تسجيل الدخول" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(403).json({ success: false, message: "❌ توكن غير صالح أو منتهي" });
  }

  // ✅ تحقق من id صالح
  if (!id || typeof id !== "string" || !isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "⚠️ معرف المنتج غير صالح" });
  }

  const { name, price, category, image, featured } = req.body;

  if (!name?.trim() || !price || !category?.trim() || !image?.trim()) {
    return res.status(400).json({ success: false, message: "⚠️ يرجى تعبئة جميع الحقول المطلوبة" });
  }

  try {
    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        price,
        category: category.trim(),
        image: image.trim(),
        featured: !!featured,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "🚫 المنتج غير موجود" });
    }

    return res.status(200).json({ success: true, product: updated });
  } catch (error: any) {
    console.error("❌ خطأ أثناء التحديث:", error.message);
    return res.status(500).json({
      success: false,
      message: "❌ فشل في تحديث المنتج",
      error: error.message,
    });
  }
}
