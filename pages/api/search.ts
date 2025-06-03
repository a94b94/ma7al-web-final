import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { q } = req.query;
  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query is required" });
  }

  const regex = new RegExp(q, "i");

  const products = await Product.find({
    $or: [{ name: regex }, { category: regex }],
  }).limit(10);

  return res.status(200).json({ products });
}
