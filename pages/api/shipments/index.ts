// pages/api/shipments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Shipment from "@/models/Shipment"; // ✅ تأكد أنك أنشأت هذا الموديل

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const shipments = await Shipment.find().sort({ createdAt: -1 });
      return res.status(200).json(shipments);
    } catch (error) {
      return res.status(500).json({ error: "فشل في جلب الشحنات" });
    }
  }

  res.status(405).json({ error: "الطريقة غير مدعومة" });
}
