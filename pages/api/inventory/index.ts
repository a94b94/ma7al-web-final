// pages/api/inventory/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const products = await InventoryProduct.find({ isPublished: false }).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    console.error("❌ فشل في جلب المنتجات:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
}
