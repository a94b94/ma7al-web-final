// pages/api/invoices/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import PurchaseInvoice from "@/models/PurchaseInvoice";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const invoice = await PurchaseInvoice.findById(id).populate("products");

    if (!invoice) {
      return res.status(404).json({ error: "لم يتم العثور على الفاتورة" });
    }

    res.status(200).json(invoice);
  } catch (err) {
    console.error("❌ فشل في جلب الفاتورة:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
}
