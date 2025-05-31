// File: pages/api/ads/active.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Ad from "@/models/Ad";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();

  const now = new Date();

  try {
    const ad = await Ad.findOne({ expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .populate("productId");

    if (!ad) return res.status(404).json({ message: "لا يوجد إعلان نشط حاليًا" });

    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب الإعلان" });
  }
}
