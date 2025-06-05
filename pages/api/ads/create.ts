import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ad from "@/models/Ad";
import { isValidObjectId } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const { productId, title, description, expiresAt } = req.body;

    if (!productId || !title || !description || !expiresAt) {
      return res.status(400).json({ success: false, message: "جميع الحقول مطلوبة" });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "معرّف المنتج غير صالح" });
    }

    if (new Date(expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: "تاريخ الانتهاء يجب أن يكون مستقبليًا" });
    }

    const newAd = await Ad.create({
      productId,
      title,
      description,
      expiresAt,
    });

    await newAd.populate('productId'); // اختياري

    return res.status(201).json({ success: true, ad: newAd });
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء الإعلان:", error.message);
    return res.status(500).json({ success: false, message: "خطأ داخلي في الخادم" });
  }
}
