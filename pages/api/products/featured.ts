import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    const featuredProducts = await Product.find({ featured: true }).sort({ createdAt: -1 });
    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error("❌ فشل في جلب المنتجات المميزة:", error);
    res.status(500).json({ message: "حدث خطأ أثناء الجلب" });
  }
}
