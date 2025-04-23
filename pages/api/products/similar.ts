import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { category, exclude } = req.query;

  if (!category || typeof category !== "string") {
    return res.status(400).json({ error: "القسم مطلوب" });
  }

  try {
    const products = await Product.find({
      category,
      _id: { $ne: exclude }, // استبعاد المنتج الحالي
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب المنتجات المشابهة" });
  }
}
