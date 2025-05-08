// pages/api/products/new.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // منع التخزين المؤقت
  res.setHeader("Cache-Control", "no-store");

  try {
    await connectToDatabase();

    const newProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(12);

    res.status(200).json(newProducts);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات الجديدة:", error.message || error);
    res.status(500).json({ error: "فشل في جلب المنتجات الجديدة" });
  }
}
