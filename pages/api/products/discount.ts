import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  try {
    const discounted = await Product.find({ discount: { $gt: 0 } }).sort({ createdAt: -1 }).limit(12);
    res.status(200).json(discounted);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب المنتجات المخفضة" });
  }
}
