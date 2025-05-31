// pages/api/ads/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Ad from "@/models/Ad";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "POST") {
    const { productId, title, description, durationHours } = req.body;

    if (!productId || !title || !durationHours) {
      return res.status(400).json({ error: "البيانات غير مكتملة" });
    }

    try {
      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
      const newAd = new Ad({ productId, title, description, expiresAt });
      await newAd.save();
      return res.status(201).json({ message: "تم إنشاء الإعلان بنجاح" });
    } catch (error) {
      return res.status(500).json({ error: "فشل في إنشاء الإعلان" });
    }
  }

  if (req.method === "GET") {
    try {
      const now = new Date();
      const ad = await Ad.findOne({ expiresAt: { $gt: now } }).populate("productId");
      return res.status(200).json(ad);
    } catch (error) {
      return res.status(500).json({ error: "فشل في جلب الإعلان" });
    }
  }

  return res.status(405).json({ error: "الطريقة غير مدعومة" });
}
