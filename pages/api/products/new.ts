// pages/api/products/new.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  // منع التخزين المؤقت
  res.setHeader("Cache-Control", "no-store");

  try {
    await connectToDatabase();

    const newProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(); // ✅ تسريع الاستعلام

    return res.status(200).json(newProducts);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات الجديدة:", error.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات الجديدة" });
  }
}
