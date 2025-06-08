// pages/api/local-sale/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const { phone, fromDate, toDate } = req.query;
    const filter: any = {};

    if (phone) {
      filter.phone = phone;
    }

    if (fromDate && toDate) {
      filter.createdAt = {
        $gte: new Date(fromDate as string),
        $lte: new Date(toDate as string),
      };
    }

    const invoices = await LocalInvoice.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, invoices });
  } catch (err) {
    console.error("❌ فشل في جلب الفواتير:", err);
    return res.status(500).json({ success: false, error: "فشل في جلب الفواتير" });
  }
}
