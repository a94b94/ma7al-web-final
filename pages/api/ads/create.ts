import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ad from "@/models/Ad";
import { isValidObjectId } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "🚫 غير مسموح استخدام هذا النوع من الطلبات" });
  }

  try {
    await dbConnect();

    const { productId, title, description, expiresAt } = req.body;

    // تحقق من الحقول المطلوبة
    if (!productId || !title || !description || !expiresAt) {
      return res.status(400).json({ success: false, message: "⚠️ جميع الحقول مطلوبة" });
    }

    // تحقق من صلاحية معرف المنتج
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "⚠️ معرف المنتج غير صالح" });
    }

    // تحقق من تاريخ الانتهاء
    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: "⚠️ تاريخ الانتهاء غير صالح أو سابق" });
    }

    // إنشاء الإعلان
    const newAd = await Ad.create({
      productId,
      title,
      description,
      expiresAt: expiryDate,
    });

    // محاولة ربط معلومات المنتج إن وجدت
    try {
      await newAd.populate('productId');
    } catch (err) {
      console.warn("⚠️ لم يتم ربط المنتج تلقائيًا:", err);
    }

    return res.status(201).json({ success: true, ad: newAd });
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء الإعلان:", error.message);
    return res.status(500).json({ success: false, message: "❌ حدث خطأ داخلي أثناء إنشاء الإعلان" });
  }
}
