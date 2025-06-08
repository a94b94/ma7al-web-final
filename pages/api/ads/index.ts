// pages/api/ads/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Ad from "@/models/Ad";
import { isValidObjectId } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "POST") {
    const { productId, title, description, durationHours } = req.body;

    if (!productId || !title || !durationHours) {
      return res.status(400).json({ success: false, message: "⚠️ البيانات غير مكتملة" });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "⚠️ معرف المنتج غير صالح" });
    }

    try {
      const expiresAt = new Date(Date.now() + Number(durationHours) * 60 * 60 * 1000);

      const newAd = await Ad.create({
        productId,
        title,
        description,
        expiresAt,
      });

      await newAd.populate("productId");

      return res.status(201).json({
        success: true,
        message: "✅ تم إنشاء الإعلان بنجاح",
        ad: newAd,
      });
    } catch (error: any) {
      console.error("❌ خطأ في إنشاء الإعلان:", error.message);
      return res.status(500).json({ success: false, message: "❌ فشل في إنشاء الإعلان" });
    }
  }

  if (req.method === "GET") {
    try {
      const now = new Date();

      const ad = await Ad.findOne({ expiresAt: { $gt: now } })
        .sort({ createdAt: -1 })
        .populate("productId");

      if (!ad) {
        return res.status(404).json({ success: false, message: "🚫 لا يوجد إعلان نشط حاليًا" });
      }

      return res.status(200).json({ success: true, ad });
    } catch (error: any) {
      console.error("❌ خطأ في جلب الإعلان:", error.message);
      return res.status(500).json({ success: false, message: "❌ فشل في جلب الإعلان" });
    }
  }

  return res.status(405).json({ success: false, message: "🚫 الطريقة غير مدعومة" });
}
