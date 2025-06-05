// pages/api/products/similar.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Product from "@/models/Product";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  await connectDB();

  const { category, exclude } = req.query;

  if (!category || typeof category !== "string") {
    return res.status(400).json({ error: "❗ الفئة غير محددة أو غير صحيحة" });
  }

  const filter: any = {
    category,
    isPublished: true,
  };

  if (
    exclude &&
    typeof exclude === "string" &&
    mongoose.Types.ObjectId.isValid(exclude)
  ) {
    filter._id = { $ne: new mongoose.Types.ObjectId(exclude) };
  }

  try {
    const products = await Product.find(filter)
      .populate("storeId", "name") // ✅ جلب اسم المتجر فقط
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return res.status(200).json(products);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات المشابهة:", error.message || error);
    return res.status(500).json({ error: "⚠️ حدث خطأ أثناء جلب المنتجات المشابهة" });
  }
}
