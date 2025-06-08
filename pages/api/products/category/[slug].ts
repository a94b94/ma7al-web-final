// pages/api/products/category/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ طريقة الطلب غير مسموحة" });
  }

  await connectToDatabase();

  const { slug } = req.query;

  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    return res.status(400).json({ error: "❗ القسم غير صالح أو مفقود" });
  }

  try {
    const products = await Product.find({
      category: slug.trim(),
      isPublished: true,
    })
      .sort({ createdAt: -1 }) // ترتيب من الأحدث
      .limit(100)              // حد أقصى للنتائج لزيادة الأمان
      .lean();

    return res.status(200).json({ success: true, products });
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error.message);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات من السيرفر" });
  }
}
