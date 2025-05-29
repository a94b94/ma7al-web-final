// pages/api/products/similar.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { category, exclude } = req.query;

  if (!category) return res.status(400).json({ error: "فئة غير محددة" });

  const filter: any = { category };
  if (exclude) filter._id = { $ne: exclude };

  const products = await Product.find(filter).limit(8);
  res.status(200).json(products);
}
