// pages/api/products/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import { isValidObjectId } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  // ✅ حماية: تحقق من التوكن
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: "🚫 غير مصرح" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "🚫 الطريقة غير مدعومة" });
  }

  // ✅ تحقق من id صالح
  if (!id || typeof id !== "string" || !isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "⚠️ معرف غير صالح" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "🚫 المنتج غير موجود" });
    }

    return res.status(200).json({ success: true, message: "✅ تم حذف المنتج بنجاح" });
  } catch (error: any) {
    console.error("❌ خطأ في الحذف:", error.message);
    return res.status(500).json({ success: false, message: "❌ حدث خطأ أثناء الحذف" });
  }
}
