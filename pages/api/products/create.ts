import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "❌ الطريقة غير مسموحة" });
  }

  try {
    await dbConnect();

    const {
      name,
      price,
      category,
      images,
      barcode,
      discount = 0,
      isFeatured = false,
      highlightHtml = ""
    } = req.body;

    // ✅ تحقق من الحقول المطلوبة
    if (
      !name || typeof name !== "string" ||
      !category || typeof category !== "string" ||
      !Array.isArray(images) || images.length === 0 ||
      price === undefined || typeof price !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "❗ جميع الحقول المطلوبة يجب تعبئتها بشكل صحيح"
      });
    }

    // ✅ التحقق من وجود المنتج بنفس الباركود
    if (barcode && typeof barcode === "string") {
      const exists = await Product.findOne({ barcode });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "⚠️ يوجد منتج بنفس الباركود بالفعل"
        });
      }
    }

    const newProduct = await Product.create({
      name,
      price,
      category,
      images,
      barcode: barcode || "",
      discount,
      isFeatured,
      highlightHtml,
    });

    return res.status(201).json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("❌ خطأ أثناء حفظ المنتج:", error.message);
    return res.status(500).json({
      success: false,
      message: "⚠️ حدث خطأ غير متوقع أثناء حفظ المنتج"
    });
  }
}
