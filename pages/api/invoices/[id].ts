// pages/api/invoices/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "معرّف الفاتورة غير صالح" });
  }

  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        const invoice = await PurchaseInvoice.findById(id).populate("products");
        if (!invoice) return res.status(404).json({ error: "لم يتم العثور على الفاتورة" });
        return res.status(200).json(invoice);
      } catch (err) {
        console.error("❌ فشل في جلب الفاتورة:", err);
        return res.status(500).json({ error: "حدث خطأ أثناء جلب الفاتورة" });
      }

    case "PATCH":
      try {
        const { notes, status } = req.body;

        const updateData: any = {};
        if (notes !== undefined) updateData.notes = notes;
        if (status !== undefined) updateData.status = status;

        const updated = await PurchaseInvoice.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: "الفاتورة غير موجودة" });

        return res.status(200).json({ success: true, invoice: updated });
      } catch (err) {
        console.error("❌ فشل في تعديل الفاتورة:", err);
        return res.status(500).json({ error: "حدث خطأ أثناء التعديل" });
      }

    case "DELETE":
      try {
        const deleted = await PurchaseInvoice.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: "الفاتورة غير موجودة" });

        return res.status(200).json({ success: true });
      } catch (err) {
        console.error("❌ فشل في حذف الفاتورة:", err);
        return res.status(500).json({ error: "حدث خطأ أثناء الحذف" });
      }

    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}
