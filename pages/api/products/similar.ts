import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مدعومة" });
  }

  await connectToDatabase();

  const { category, exclude } = req.query;

  if (!category || typeof category !== "string") {
    return res.status(400).json({ error: "⚠️ القسم مطلوب" });
  }

  try {
    const filter: any = { category };

    // ✅ استبعاد منتج باستخدام ObjectId فقط إذا كان صحيحًا
    if (exclude && typeof exclude === "string" && mongoose.Types.ObjectId.isValid(exclude)) {
      filter._id = { $ne: new mongoose.Types.ObjectId(exclude) };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return res.status(200).json(products);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات المشابهة:", error.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات المشابهة" });
  }
}
