import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, error: "❌ Method not allowed" });
  }

  try {
    await dbConnect();
  } catch (err) {
    return res.status(500).json({ success: false, error: "❌ فشل الاتصال بقاعدة البيانات" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "❗ معرف غير صالح أو مفقود" });
  }

  try {
    const deleted = await LocalInvoice.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "⚠️ الفاتورة غير موجودة" });
    }

    return res.status(200).json({ success: true, message: "✅ تم حذف الفاتورة بنجاح", deleted });
  } catch (error) {
    console.error("❌ خطأ أثناء الحذف:", error);
    return res.status(500).json({ success: false, error: "❌ فشل في حذف الفاتورة" });
  }
}
