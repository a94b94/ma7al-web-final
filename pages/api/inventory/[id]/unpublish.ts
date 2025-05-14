// pages/api/inventory/[id]/unpublish.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "معرّف غير صالح" });
  }

  try {
    await connectDB();

    const updated = await InventoryProduct.findByIdAndUpdate(
      id,
      { isPublished: false },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "المنتج غير موجود" });
    }

    return res.status(200).json({ success: true, product: updated });
  } catch (error) {
    console.error("❌ فشل في إلغاء النشر:", error);
    return res.status(500).json({ error: "فشل في إلغاء النشر" });
  }
}
