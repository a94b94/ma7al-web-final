// /pages/api/products/by-store.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { id, category } = req.query;

  // ✅ تحقق من id
  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "❗ معرف المتجر غير صالح أو مفقود" });
  }

  try {
    await connectToDatabase();

    const filter: any = { storeId: id };
    
    // ✅ دعم فلترة بالقسم مع حماية من الحقن
    if (category && typeof category === "string" && category.trim() !== "") {
      filter.category = category.trim();
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 }) // ترتيب من الأحدث
      .limit(100) // حد أقصى للنتائج لزيادة الأمان
      .lean();

    return res.status(200).json({ success: true, products });
  } catch (error: any) {
    console.error("❌ خطأ في جلب المنتجات:", error.message);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات" });
  }
}
