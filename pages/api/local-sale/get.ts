import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, message: "Missing ID" });
  }

  try {
    const invoice = await LocalInvoice.findById(id).lean();
    if (!invoice) return res.status(404).json({ success: false, message: "Not found" });

    invoice._id = invoice._id.toString();
    invoice.createdAt = invoice.createdAt.toString();

    return res.status(200).json({ success: true, invoice });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
