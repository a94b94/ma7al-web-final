// pages/api/purchase-invoices/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import PurchaseInvoice from "@/models/PurchaseInvoice";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await dbConnect();
    const invoices = await PurchaseInvoice.find({}).sort({ date: -1 }).lean();
    res.status(200).json(invoices);
  } catch (err) {
    console.error("❌ Error fetching purchase invoices:", err);
    res.status(500).json({ error: "فشل في تحميل الفواتير" });
  }
}
