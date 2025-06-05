// pages/api/products/category/[slug].ts
import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "طريقة الطلب غير مسموحة" });
  }

  await connectToDatabase();

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "❗ القسم غير صالح أو مفقود" });
  }

  try {
    const products = await Product.find({
      category: slug,
      isPublished: true,
    }).lean();

    return res.status(200).json(products);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error.message);
    return res.status(500).json({ error: "فشل في جلب المنتجات من السيرفر" });
  }
}
