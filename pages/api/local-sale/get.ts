import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
  } catch (err) {
    return res.status(500).json({ success: false, message: "❌ فشل الاتصال بقاعدة البيانات" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "❗ معرف الفاتورة غير صالح" });
  }

  try {
    const invoice = await LocalInvoice.findById(id, null, { lean: true }) as any;

    if (!invoice) {
      return res.status(404).json({ success: false, message: "⚠️ لم يتم العثور على الفاتورة" });
    }

    return res.status(200).json({
      success: true,
      invoice: {
        ...invoice,
        _id: invoice._id.toString(),
        createdAt: invoice.createdAt ? new Date(invoice.createdAt).toISOString() : "",
        updatedAt: invoice.updatedAt ? new Date(invoice.updatedAt).toISOString() : "",
      },
    });
  } catch (err) {
    console.error("❌ خطأ في جلب الفاتورة:", err);
    return res.status(500).json({ success: false, message: "❌ خطأ داخلي أثناء جلب الفاتورة" });
  }
}
