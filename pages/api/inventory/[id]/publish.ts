// pages/api/inventory/[id]/publish.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";
import InventoryProduct from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "طريقة الطلب غير مسموحة" });
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "معرّف المنتج غير صالح" });
  }

  try {
    await connectDB();

    const product = await InventoryProduct.findById(id);
    if (!product) {
      return res.status(404).json({ error: "المنتج غير موجود في المخزن" });
    }

    if (product.isPublished) {
      return res.status(200).json({ success: true, message: "✅ المنتج منشور مسبقًا" });
    }

    product.isPublished = true;
    await product.save();

    res.status(200).json({ success: true, message: "✅ تم نشر المنتج بنجاح" });
  } catch (err) {
    console.error("❌ خطأ في نشر المنتج:", err);
    res.status(500).json({ error: "فشل في نشر المنتج" });
  }
}
