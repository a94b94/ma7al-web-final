import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, category } = req.query;

  // ✅ تحقق من وجود id وصحته
  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "❗ معرف المتجر غير صالح أو مفقود" });
  }

  try {
    await connectToDatabase();

    const filter: any = { storeId: id };
    if (category && typeof category === "string") {
      filter.category = category;
    }

    const products = await Product.find(filter).lean();

    return res.status(200).json(products);
  } catch (error: any) {
    console.error("❌ خطأ في جلب المنتجات:", error.message);
    return res.status(500).json({ error: "فشل في جلب المنتجات" });
  }
}
