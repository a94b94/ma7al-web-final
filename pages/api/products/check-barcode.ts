import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  const { barcode } = req.body;

  if (!barcode || typeof barcode !== "string") {
    return res.status(400).json({ error: "❗ الباركود مطلوب ويجب أن يكون نصًا" });
  }

  try {
    await connectToDatabase();

    const product = await Product.findOne({ barcode }).lean();

    if (product) {
      return res.status(200).json({ exists: true, product });
    }

    return res.status(200).json({ exists: false });
  } catch (error: any) {
    console.error("❌ خطأ أثناء فحص الباركود:", error.message);
    return res.status(500).json({ error: "⚠️ حدث خطأ غير متوقع أثناء الفحص" });
  }
}
