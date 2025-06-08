// pages/api/inventory/[id]/unpublish.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";
import mongoose from "mongoose";

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

    const updated = await InventoryProduct.findByIdAndUpdate(
      id,
      { isPublished: false },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "❌ المنتج غير موجود في قاعدة البيانات" });
    }

    return res.status(200).json({ success: true, product: updated, message: "✅ تم إلغاء نشر المنتج" });
  } catch (error) {
    console.error("❌ خطأ أثناء إلغاء النشر:", error);
    return res.status(500).json({ error: "حدث خطأ داخلي أثناء إلغاء النشر" });
  }
}
