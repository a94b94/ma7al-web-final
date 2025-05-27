import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "❌ الطريقة غير مسموحة" });
  }

  await dbConnect();

  try {
    const { name, price, category, image, barcode, discount, isFeatured } = req.body;

    // ✅ التحقق من الحقول الأساسية
    if (
      !name || typeof name !== "string" ||
      !category || typeof category !== "string" ||
      !image || typeof image !== "string" ||
      price === undefined || typeof price !== "number"
    ) {
      return res.status(400).json({ success: false, message: "❗ يرجى إدخال جميع الحقول المطلوبة بشكل صحيح" });
    }

    const product = await Product.create({
      name,
      price,
      category,
      image,
      barcode: barcode ?? "",
      discount: discount ?? 0,
      isFeatured: isFeatured ?? false,
    });

    return res.status(201).json({ success: true, product });
  } catch (error: any) {
    console.error("❌ خطأ أثناء حفظ المنتج:", error.message);
    return res.status(500).json({ success: false, message: "⚠️ فشل في حفظ المنتج" });
  }
}
