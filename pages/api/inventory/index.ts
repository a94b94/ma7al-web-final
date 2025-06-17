// pages/api/inventory/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    // يمكن إضافة فلتر للـ published عبر query لاحقًا
    const products = await InventoryProduct.find({ isPublished: false }).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات من المخزن:", error.message);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب بيانات المخزن" });
  }
}
