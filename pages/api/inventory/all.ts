// pages/api/inventory/all.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const { category, search, isPublished } = req.query;
    const filter: any = {};

    // فلترة حسب القسم
    if (category && typeof category === "string" && category !== "all") {
      filter.category = category;
    }

    // فلترة حسب الاسم
    if (search && typeof search === "string" && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // فلترة حسب حالة النشر
    if (isPublished === "true") filter.isPublished = true;
    if (isPublished === "false") filter.isPublished = false;

    const products = await InventoryProduct.find(filter).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    console.error("❌ فشل في جلب جميع المنتجات:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
}
