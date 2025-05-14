// pages/api/inventory/[id]/publish.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const product = await InventoryProduct.findById(id?.toString());
    if (!product) {
      return res.status(404).json({ error: "المنتج غير موجود" });
    }

    product.isPublished = true;
    await product.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ فشل في نشر المنتج:", err);
    res.status(500).json({ error: "فشل في النشر" });
  }
}
