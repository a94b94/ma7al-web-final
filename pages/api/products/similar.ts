import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { category, exclude } = req.query;

  if (!category || typeof category !== "string") {
    return res.status(400).json({ error: "⚠️ القسم مطلوب" });
  }

  try {
    const filter: any = { category };

    // استبعاد المنتج الحالي إن وجد
    if (exclude && typeof exclude === "string") {
      filter._id = { $ne: exclude };
    }

    const products = await Product.find(filter)
      .limit(4)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(products);
  } catch (error) {
    console.error("❌ خطأ أثناء جلب المنتجات المشابهة:", error);
    return res.status(500).json({ error: "فشل في جلب المنتجات المشابهة" });
  }
}
