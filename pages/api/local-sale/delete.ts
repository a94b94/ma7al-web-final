import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  await dbConnect();

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, error: "Missing or invalid ID" });
  }

  try {
    const deleted = await LocalInvoice.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Invoice not found" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: "فشل في الحذف" });
  }
}
