import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(12); // ✅ عرض آخر 12 منتج

    return res.status(200).json({ products });
  } catch (error) {
    console.error("❌ Error fetching newest products:", error);
    return res.status(500).json({ error: "فشل في جلب المنتجات" });
  }
}