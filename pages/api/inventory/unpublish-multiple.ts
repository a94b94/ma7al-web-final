// pages/api/inventory/unpublish-multiple.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "طريقة غير مدعومة" });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "يرجى توفير قائمة من المعرّفات" });
  }

  const validIds = ids.filter((id: any) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    return res.status(400).json({ error: "جميع المعرفات غير صالحة" });
  }

  try {
    await connectDB();

    const result = await InventoryProduct.updateMany(
      { _id: { $in: validIds } },
      { isPublished: false }
    );

    return res.status(200).json({
      success: true,
      updatedCount: result.modifiedCount,
      message: `✅ تم إلغاء نشر ${result.modifiedCount} منتج.`,
    });
  } catch (error) {
    console.error("❌ خطأ في الإلغاء الجماعي للنشر:", error);
    return res.status(500).json({ error: "فشل في إلغاء النشر الجماعي" });
  }
}
