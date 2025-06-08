// File: pages/api/ads/active.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Ad from "@/models/Ad";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  await connectDB();

  const now = new Date();

  try {
    const ad = await Ad.findOne({ expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .populate("productId", "name price images discount"); // ✅ نختار الحقول المهمة فقط

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "❗ لا يوجد إعلان نشط حاليًا",
      });
    }

    return res.status(200).json({
      success: true,
      ad,
    });
  } catch (error: any) {
    console.error("⛔ Error fetching active ad:", error.message);
    return res.status(500).json({
      success: false,
      error: "⚠️ فشل في جلب الإعلان",
    });
  }
}
