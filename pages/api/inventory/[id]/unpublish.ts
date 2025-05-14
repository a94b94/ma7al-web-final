// pages/api/inventory/[id]/unpublish.ts
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

    const updated = await InventoryProduct.findByIdAndUpdate(id, { isPublished: false });

    if (!updated) {
      return res.status(404).json({ error: "المنتج غير موجود" });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ فشل في إلغاء النشر:", err);
    res.status(500).json({ error: "فشل في إلغاء النشر" });
  }
}
