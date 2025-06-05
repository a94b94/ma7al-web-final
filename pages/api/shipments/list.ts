import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Shipment from "@/models/Shipment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const shipments = await Shipment.find({}, null, { sort: { createdAt: -1 } }).lean();

    return res.status(200).json(shipments);
  } catch (error) {
    console.error("❌ فشل في جلب الشحنات:", error);
    return res.status(500).json({ success: false, error: "خطأ داخلي في السيرفر" });
  }
}
