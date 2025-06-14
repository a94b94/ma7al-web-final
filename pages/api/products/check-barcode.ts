// pages/api/products/check-barcode.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  let barcode: string | undefined;

  if (req.method === "POST") {
    barcode = req.body.barcode;
  } else if (req.method === "GET") {
    barcode = req.query.barcode as string;
  } else {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة - استخدم GET أو POST فقط" });
  }

  // ✅ التحقق من صحة الباركود
  if (!barcode || typeof barcode !== "string" || barcode.trim().length === 0) {
    return res.status(400).json({ error: "❗ يرجى إدخال باركود صالح" });
  }

  try {
    const product = await Product.findOne({ barcode: barcode.trim() }).lean();

    if (product) {
      return res.status(200).json({
        exists: true,
        product,
        message: "✅ المنتج موجود بالفعل في قاعدة البيانات.",
      });
    }

    return res.status(200).json({
      exists: false,
      message: "ℹ️ لم يتم العثور على منتج بهذا الباركود.",
    });
  } catch (error: any) {
    console.error("❌ خطأ أثناء فحص الباركود:", error.message);
    return res.status(500).json({ error: "⚠️ حدث خطأ غير متوقع أثناء الفحص" });
  }
}
