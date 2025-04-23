import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: "معرف المنتج غير صالح" });
    }

    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "لم يتم العثور على المنتج" });
    }

    return res.status(200).json(product);
  } catch (error: any) {
    console.error("❌ خطأ في API:", error.message);
    return res.status(500).json({ error: "فشل في جلب المنتج" });
  }
}
