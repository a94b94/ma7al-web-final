// File: pages/api/inventory/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectDB();

  try {
    const { name, barcode, category, quantity, purchasePrice, isPublished } = req.body;

    if (!name || typeof quantity !== "number" || typeof purchasePrice !== "number") {
      return res.status(400).json({ message: "بيانات المنتج غير مكتملة" });
    }

    const newProduct = await InventoryProduct.create({
      name,
      barcode,
      category: category || "غير مصنّف",
      quantity,
      purchasePrice,
      isPublished: !!isPublished,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ فشل في إضافة المنتج:", error);
    res.status(500).json({ message: "فشل في إضافة المنتج" });
  }
}
