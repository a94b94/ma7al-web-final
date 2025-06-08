// pages/api/products/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "❌ الطريقة غير مسموحة" });
  }

  // ✅ تحقق من التوكن
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "🚫 غير مصرح. يجب تسجيل الدخول" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(403).json({ success: false, message: "❌ توكن غير صالح أو منتهي" });
  }

  const {
    name,
    price,
    category,
    images,
    barcode,
    discount = 0,
    highlightHtml = "",
  } = req.body;

  // ✅ تحقق من القيم
  if (
    !name?.trim() ||
    !category?.trim() ||
    typeof price !== "number" ||
    !Array.isArray(images) ||
    images.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "⚠️ الحقول الأساسية مطلوبة ويجب أن تحتوي الصور على صورة واحدة على الأقل",
    });
  }

  const validImages = images.every(
    (img: any) => img.url && img.public_id
  );
  if (!validImages) {
    return res.status(400).json({
      success: false,
      message: "⚠️ كل صورة يجب أن تحتوي على `url` و `public_id`",
    });
  }

  try {
    const newProduct = await Product.create({
      name: name.trim(),
      price,
      category: category.trim(),
      images,
      barcode: barcode?.trim() || "",
      discount,
      highlightHtml,
    });

    return res.status(201).json({
      success: true,
      message: "✅ تم حفظ المنتج بنجاح",
      product: newProduct,
    });
  } catch (error: any) {
    console.error("❌ فشل حفظ المنتج:", error.message);
    return res.status(500).json({
      success: false,
      message: "🚨 حدث خطأ أثناء حفظ المنتج",
      error: error.message,
    });
  }
}
