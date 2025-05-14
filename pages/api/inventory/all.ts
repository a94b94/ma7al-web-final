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

    const { category, search } = req.query;
    const filter: any = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search && typeof search === "string") {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await InventoryProduct.find(filter);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ فشل في جلب جميع المنتجات:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
}
